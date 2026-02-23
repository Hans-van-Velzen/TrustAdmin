
const pgenv = dotenv.config({ path: '../.env' });
const TraceLevel = pgenv.parsed.TRACE_LEVEL;
// Trace Level: 0 = FATAL; 1 = ERROR; 2 = WARNING; 3 = INFO

export function Trace(message, level = 0, origin = '') {
    let msg;
    if (level > TraceLevel) { return }; // do not log
    if (origin == '' || origin == undefined) {msg = Now() + " - " + message}
    else { msg = Now() + " - " + origin+ " - " + message}
    console.log(msg);    
};

export function Now() {
    const current = new Date();
    // prints date & time in YYYY-MM-DD HH:mm:ss format
    // current date
    let date = ("0" + current.getDate()).slice(-2);
    // current month
    let month = ("0" + (current.getMonth() + 1)).slice(-2);
    // current year
    let year = current.getFullYear();
    // current hours
    let hours = ("0" + current.getHours()).slice(-2);
    // current minutes
    let minutes = ("0" + current.getMinutes()).slice(-2);    
    // current seconds
    let seconds = ("0" + current.getSeconds()).slice(-2);

    return (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
};