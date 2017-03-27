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
    // 'cmi.interactions._count': '0',
    //'cmi.objectives._count': '4',
  },
};
const cmiNames = {
  1.2: {
    enry: 'cmi.core.entry',
    exit: 'cmi.core.exit',
    score_raw: 'cmi.core.score.raw',
    score_max: 'cmi.core.score.max',
    score_min: 'cmi.core.score.min',
    session_time: 'cmi.core.session_time',
    total_time: 'cmi.core.total_time',
  },
  2004: {
    entry: 'cmi.entry',
    exit: 'cmi.exit',
    score_raw: 'cmi.score.raw',
    score_max: 'cmi.score.max',
    score_min: 'cmi.score.min',
    session_time: 'cmi.session_time',
    total_time: 'cmi.total_time',
  },
};

const createModel = ({ objectives, launch_data, total_time }) => {
  const model = {};
  if (total_time) {
    model[cmiNames[schema].total_time] = total_time;
  }
  if (launch_data) {
    model['cmi.launch_data'] = launch_data;
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
  let completion_status;
  let success_status;
  if (schema === '1.2') {
    completion_status = ['completed', 'incomplete', 'not attempted']
      .indexOf(cmi['cmi.core.completion_status']) >= 0 ? cmi['cmi.core.lesson_status'] : 'unknown';
    success_status = ['passed', 'failed']
      .indexOf(cmi['cmi.core.lesson_status']) >= 0 ? cmi['cmi.core.lesson_status'] : 'unknown';
  } else {
    completion_status = cmi['cmi.completion_status'];
    success_status = cmi['cmi.success_status'];
  }
  return {
    score_raw: cmi[cmiN.score_raw],
    score_max: cmi[cmiN.score_max],
    score_min: cmi[cmiN.score_min],
    session_time: cmi[cmiN.session_time],
    total_time: cmi[cmiN.total_time],
    success_status,
    completion_status,
  };
};


export const exit = () => cmi[cmiNames[schema].exit];
export const entry = (value) => {
  if (['ab-initio', 'resume', ''].indexOf(value) >= 0) {
    cmi[cmiNames[schema].entry] = value;
    return value;
  }
  return cmi[cmiNames[schema].entry];
};

export const getJSONString = () => JSON.stringify(cmi);
