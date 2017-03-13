		const dictionary = {
			//cmi.core._children : (student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time, RO) Listing of supported data model elements
'cmi.core.student_id' : 'cmi.learner_id', //RO
'cmi.core.student_name' : 'cmi.learner_name', //RO
'cmi.core.lesson_location' : 'cmi.location', //RW
'cmi.core.credit' : 'cmi.credit', //RO
'cmi.core.lesson_status' : 'cmi.completion_status', //RW
// cmi.completion_status (“completed”, “incomplete”, “not attempted”, “unknown”, RW) Indicates whether the learner has completed the SCO 
// mi.core.lesson_status (“passed”, “completed”, “failed”, “incomplete”, “browsed”, “not attempted”, RW) Indicates whether the learner has completed and satisfied the requirements for the SCO
'cmi.core.entry' : 'cmi.entry',  //RO
//(“ab-initio”, “resume”, “”, RO) Asserts whether the learner has previously accessed the SCO
// (ab_initio, resume, “”, RO)
'cmi.core.score_children' : 'cmi.score._children', //RO
//(raw,min,max, RO) Listing of supported data model elements
// (scaled,raw,min,max, RO) Listing of supported data model elements
'cmi.core.score.raw' : 'cmi.score.raw', // RW
'cmi.core.score.max' : 'cmi.score.max', //RW
'cmi.core.score.min' : 'cmi.core.min', //RW
'cmi.core.total_time' : 'cmi.total_time', //RO
'cmi.core.lesson_mode' : 'cmi.mode', //RO
'cmi.core.exit' : 'cmi.exit', //WO
'cmi.core.session_time' : 'cmi.session_time', //WO
'cmi.suspend_data' : 'cmi.suspend_data', //RW
'cmi.launch_data' : 'cmi.launch_data', //RO
'cmi.comments' : 'cmi.comments_from_learner.n.comment', //RW n?
'cmi.comments_from_lms' : 'cmi.comments_from_lms.n.comment', //RO n??
/*'cmi.objectives._children (id,score,status, RO) Listing of supported data model elements
'cmi.objectives._count (non-negative integer, RO) Current number of objectives being stored by the LMS
'cmi.objectives.n.id (CMIIdentifier, RW) Unique label for the objective
'cmi.objectives.n.score._children (raw,min,max, RO) Listing of supported data model elements
'cmi.objectives.n.score.raw (CMIDecimal, RW) Number that reflects the performance of the learner, for the objective, relative to the range bounded by the values of min and max
'cmi.objectives.n.score.max (CMIDecimal, Rw) Maximum value, for the objective, in the range for the raw score
'cmi.objectives.n.score.min (CMIDecimal, RW) Minimum value, for the objective, in the range for the raw score*/
//'cmi.objectives.n.status (“passed”, “completed”, “failed”, “incomplete”, “browsed”, “not attempted”, RW) Indicates whether the learner has completed or satisfied the objective
//cmi.objectives.n.success_status (“passed”, “failed”, “unknown”, RW) Indicates whether the learner has mastered the objective
//cmi.objectives.n.completion_status (“completed”, “incomplete”, “not attempted”, “unknown”, RW) Indicates whether the learner has completed the associated objective
// ? 'cmi.student_data._children (mastery_score, max_time_allowed, time_limit_action, RO) Listing of supported data model elements
'cmi.student_data.mastery_score' : 'cmi.scaled_passing_score', //RO 
'cmi.student_data.max_time_allowed' : 'cmi.max_time_allowed ', //RO
'cmi.student_data.time_limit_action' : 'cmi.time_limit_action', //RO 
//(exit,message,” “exit,no message”,” continue,message”, “continue, no message”, RO) Indicates what the SCO should do when max_time_allowed is exceeded
'cmi.student_preference._children' : 'cmi.learner_preference._children', //RO 
// (audio,language,speed,text, RO) (audio_level,language,delivery_speed,audio_captioning, RO)
'cmi.student_preference.audio' : 'cmi.learner_preference.audio_level', //RW
'cmi.student_preference.language' : 'cmi.learner_preference.language', //RW
'cmi.student_preference.speed' : 'cmi.learner_preference.delivery_speed', //RW
'cmi.student_preference.text' : 'cmi.learner_preference.audio_captioning ', //RW
'cmi.interactions.n.time' : 'cmi.interactions.n.timestamp', //RW n??
'cmi.interactions.n.student_response' : 'cmi.interactions.n.learner_response' //WO
		}