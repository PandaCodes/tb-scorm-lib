import pkg from '../../package.json'; // path resolve?

let cmi = {};
let schema = '2004';

const cmiDefault = {
  1.2: {
    'cmi.core.lesson_mode': 'normal',
    'cmi.core.credit': 'credit',
    'cmi.core.entry': 'ab-initio',
    'cmi.core.lesson_status': 'not attempted',
    'cmi.core.lesson_location': '',
    'cmi.core.total_time': 0,
    'cmi.student_data.time_limit_action': 'continue,no message',
  },
  2004: {
    'cmi._version': pkg.version,
    'cmi.mode': 'normal',
    'cmi.credit': 'credit',
    'cmi.entry': 'ab-initio',
    'cmi.success_status': 'unknown',
    'cmi.completion_status': 'unknown',
    'cmi.location': '',
    'cmi.total_time': 0,
    'cmi.time_limit_action': 'continue,no message',
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

function getStatus(n) {
  let completionStatus;
  let successStatus;
  if (schema === '1.2') {
    const lsKey = n ? `cmi.objectives.${n}.status` : 'cmi.core.lesson_status';
    if (['browsed', 'incomplete', 'failed'].indexOf(cmi[lsKey]) >= 0) {
      completionStatus = 'incomplete';
    } else if (['passed', 'completed'].indexOf(cmi[lsKey]) >= 0) {
      completionStatus = 'completed';
    } else {
      completionStatus = 'unknown';
    }
    successStatus = ['passed', 'failed']
      .indexOf(cmi[lsKey]) >= 0 ? cmi[lsKey] : 'unknown';
  } else {   // TODO badSchem error?
    const prefix = n ? `cmi.objectives.${n}.` : 'cmi.';
    completionStatus = cmi[`${prefix}completion_status`];
    successStatus = cmi[`${prefix}success_status`];
  }
  return [completionStatus, successStatus];
}
// Alias
const getObjectiveStatus = getStatus;

function getObjectives() {
  const count = cmi['cmi.objectives._count'];
  const objectives = [];
  if (!count || Number.isInteger(count)) return objectives;
  for (let i = 0; i < n; i++) {
    const [completionStatus, successStatus] = getObjectiveStatus(i);
    objectives.push({
      id: cmi[`cmi.objectives.${i}.id`],
      score: {
        raw: cmi[`cmi.objectives.${i}.score.raw`],
        min: cmi[`cmi.objectives.${i}.score.min`],
        max: cmi[`cmi.objectives.${i}.score.max`],
        //scaled
      },
      completion_status: completionStatus,
      success_status: successStatus,
      description: cmi[`cmi.objectives.${i}.description`] || '',
    });
  }
  return objectives;
}

function parseTime() {
  const time = cmi[cmiNames[schema].session_time];
  if (!time) return 0;
  if (schema === '1.2') {
    return time.split(':').reduceRight((accT, t) => (accT * 1) + (t * 60));
  }
  const [, h, m, s] = time.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)$/);
  return ((h || 0) * 3600) + ((m || 0) * 60) + ((s || 0) * 1);
}

function createModel({
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
}) {
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
    model[cmiNames[schema].total_time] = totalTime; // TODO!
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
}

export function init(schemaVersion, initModel) {
  schema = schemaVersion === '1.2' ? '1.2' : '2004';

  const cmiInit = createModel(initModel);
  cmi = Object.assign({}, cmiDefault[schema], cmiInit);
}

// load from string + additional data
export function restore(storedCmiString = '', data = {}) {
  // is there everything we need?
  cmi = Object.assign({}, JSON.parse(storedCmiString), createModel({ totalTime: data.total_time }));
}

export const get = name => cmi[name];
export const set = (name, value) => { cmi[name] = value; };

export function getResults() {
  console.log('results get');
  const cmiN = cmiNames[schema];
  const [completionStatus, successStatus] = getStatus();

  console.log('results get end');

  console.log('stat', completionStatus, successStatus);
  // console.log('lal', parseTime());

  // const objectives = getObjectives();
  // console.log('objvs', JSON.stringify(objectives));
  return {
    score_raw: cmi[cmiN.score_raw],
    score_max: cmi[cmiN.score_max],
    score_min: cmi[cmiN.score_min],
    session_time: parseTime(),
    total_time: cmi[cmiN.total_time],
    success_status: successStatus,
    completion_status: completionStatus,
    objectives: getObjectives(),
  };
}


export function exit() {
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
}

export const getJSONString = () => JSON.stringify(cmi);

