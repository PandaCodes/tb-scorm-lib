import pkg from '../../package.json'; // path resolve?

let cmi = {};
let schema = '2004';

const cmiDefault = {
  1.2: {
    'cmi.core.lesson_mode': 'normal',
    // 'cmi.core.credit': 'credit',
    'cmi.core.entry': 'ab-initio',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.lesson_location': '',
  },
  2004: {
    'cmi._version': pkg.version,
    'cmi.mode': 'normal',
    // 'cmi.credit': 'credit',
    'cmi.entry': 'ab-initio',
    'cmi.success_status': 'unknown',
    'cmi.completion_status': 'unknown',
    'cmi.location': '',
    'cmi.total_time': 0,
    // 'cmi.interactions._count': '0',
  },
};
const cmiNames = {
  1.2: {
    enry: 'cmi.core.entry',
    exit: 'cmi.core.exit',
    learner_id: 'cmi.core.student_id',
    learner_name: 'cmi.core.student_name',
    max_time_allowed: 'cmi.max_time_allowed',
    passing_score: 'cmi.student_data.mastery_score',
    score_raw: 'cmi.core.score.raw',
    score_max: 'cmi.core.score.max',
    score_min: 'cmi.core.score.min',
    session_time: 'cmi.core.session_time',
    time_limit_action: 'cmi.student_data.time_limit_action',
    total_time: 'cmi.core.total_time',
  },
  2004: {
    entry: 'cmi.entry',
    exit: 'cmi.exit',
    learner_id: 'cmi.learner_id',
    learner_name: 'cmi.learner_name',
    max_time_allowed: 'cmi.student_data.max_time_allowed',
    passing_score: 'cmi.scaled_passing_score',
    score_raw: 'cmi.score.raw',
    score_max: 'cmi.score.max',
    score_min: 'cmi.score.min',
    session_time: 'cmi.session_time',
    time_limit_action: 'cmi.time_limit_action',
    total_time: 'cmi.total_time',
  },
};

const createModel = ({
  objectives,
  launchData,
  scaledPassingScore,
  masteryScore,
  completionThreshold,
  timeLimitAction,
  maxTimeAllowed,
  totalTime,
  learnerId,
  learnerName,
}) => {
  const model = {};
  if (completionThreshold && schema === '2004') {
    model['cmi.completion_threshold'] = completionThreshold;
  }
  if (maxTimeAllowed) {
    model[cmiNames[schema].max_time_allowed] = maxTimeAllowed;
  }
  if (timeLimitAction) {
    model[cmiNames[schema].time_limit_action] = timeLimitAction;
  }
  if (learnerId) {
    model[cmiNames[schema].learner_id] = learnerName;
  }
  if (learnerName) {
    model[cmiNames[schema].learner_name] = learnerName;
  }
  if (totalTime) {
    model[cmiNames[schema].total_time] = totalTime;
  }
  if (launchData) {
    model['cmi.launch_data'] = launchData;
  }
  if (scaledPassingScore || masteryScore) {
    model[cmiNames[schema].passing_score] = scaledPassingScore || masteryScore;
  }
  // objectives
  if (objectives && Array.isArray(objectives)) {
    model['cmi.objectives._children'] = 'id,score,success_status,completion_status,description';
    model['cmi.objectives._count'] = objectives.length;
    objectives.map((obj, i) => { model[`cmi.objectives.${i}.id`] = obj.id; return null; });
  }
  return model;
};

export const init = (schemaVersion, initModel) => {
  schema = schemaVersion === '1.2' ? '1.2' : '2004';

  const cmiInit = createModel(initModel);
  cmi = Object.assign({}, cmiDefault[schema], cmiInit);
};

// load from string + additional data
export const restore = (storedCmiString = '', data = {}) => {
  // there everything we need?
  cmi = Object.assign({}, JSON.parse(storedCmiString), createModel(data));
};

export const get = name => cmi[name];
export const set = (name, value) => { cmi[name] = value; };

export const getResults = () => {
  const cmiN = cmiNames[schema];
  let completionStatus;
  let successStatus;
  if (schema === '1.2') {
    if (['browsed', 'incomplete', 'failed'].indexOf(cmi['cmi.core.completion_status']) >= 0) {
      completionStatus = 'incomplete';
    } else if (['passed', 'completed'].indexOf(cmi['cmi.core.completion_status']) >= 0) {
      completionStatus = 'completed';
    } else {
      completionStatus = 'unknown';
    }
    successStatus = ['passed', 'failed']
      .indexOf(cmi['cmi.core.lesson_status']) >= 0 ? cmi['cmi.core.lesson_status'] : 'unknown';
  } else {
    completionStatus = cmi['cmi.completion_status'];
    successStatus = cmi['cmi.success_status'];
  }
  return {
    score_raw: cmi[cmiN.score_raw],
    score_max: cmi[cmiN.score_max],
    score_min: cmi[cmiN.score_min],
    session_time: cmi[cmiN.session_time],
    total_time: cmi[cmiN.total_time],
    success_status: successStatus,
    completion_status: completionStatus,
  };
};


export const exit = () => {
  let save;
  switch (cmi[cmiNames[schema].exit]) {
    case '' :
      save = false;
      break;
    case 'suspend':
    case 'logout':
      cmi[cmiNames[schema].entry] = 'resume';
      save = true;
      break;
    case 'normal':
    case 'time-out':
    default:
      cmi[cmiNames[schema].entry] = '';
      save = true;
      break;
  }
  return { save };
};

export const getJSONString = () => JSON.stringify(cmi);

