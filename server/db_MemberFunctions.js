import { query } from "../pgdb/index.js";
import { Trace } from "../utils/Tracer.js";

/*
get the number of members
expects:
    no parameters expected
returns:    
    return the number of members
*/
export async function getNumberOfMembers() {
    let strSQL;
    let params = [];
    let result = {};

    strSQL = 'SELECT count(1) as numrec FROM trust."Members"';
    Trace('GetNumberOfMembers -', 'getNumberOfMembers', 2);
    result = await query(strSQL, params);
    Trace(result['rows'][0]['numrec'], 'getNumberOfMembers', 2);
    return result['rows'][0]['numrec'];
};

export async function getMembers(params) {
    const strSQL = 'SELECT * FROM trust."Members" WHERE "Member_Active" = $1';
    const result = await query(strSQL, params);
    Trace ('getMembers: ');
    // Trace (result);
    return result['rows'];
};

/* 
 * GetActiveMembers
 * Return the set of active members
*/
export async function getActiveMembers() {
    const params = ['Y'];

    const result = getMembers(params);
    Trace ('getActiveMembers: ');
    Trace (result);
    return result;
};

/* 
 * GetInactiveMembers
 * Return the set of NOT active members
*/
export async function getInactiveMembers() {
    const params = ['N'];

    const result = getMembers(params);
    Trace ('getActiveMembers: ');
    Trace (result);
    return result;
};

/*
insert_a_member
try to insert a new member into the database
expects:
    Member name; 
    Member password; 
    Member email;
    Member call; 
    Member active
return:
    the Member_ID of the newly added member-record
*/
export async function insert_a_member(params){
    // insert a member that can access the app
    // in a websocket situation maybe check against the list of Members
    Trace(' params:' + params, 2, 'insert member ');
    // sanity checking on parameters
    // Member name must not be empty
    let errMsg = '';
    let strSQL;
    if (params.length < 5) {errMsg = '5 parameters expected (Member name; Member Email; Member password; Member call; Member active - but received only ' + params.length;}
    if (params.length > 5) {errMsg = '5 parameters expected (Member name; Member Email; Member password; Member call; Member active - but received ' + params.length;}
    if (params[0] === '') {errMsg = errMsg + 'Member Name (what is your name within this application) is empty'};
    if (params[1] === '') {errMsg = errMsg + 'Password is empty'};
    if (params[2] === '') {errMsg = errMsg + 'Email is empty'};
    // if (params[3] === '') {errMsg = errMsg + 'Member Call (how are you called) is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    strSQL = 'INSERT INTO trust."Members" ("Member_Name", "Member_Password", "Member_Email", "Member_Call", "Member_Active") ';
    strSQL = strSQL + 'VALUES($1, $2, $3, $4, $5) RETURNING "ID";'

    let result;
    let memberID;
    try {
        result = await query(strSQL, params);
        // console.log(result, 2, 'insert a member - result');
        // Trace(result['rows'][0], 2, 'insert a member-1');

        memberID = result['rows'][0]['ID']
        Trace('ID: ' + memberID, 2, 'insert a member');
    } catch (error) {
        Trace(error, 1, 'insert a member - error')
        // if (error.code === 23505) {throw new error('duplicate key found')}
        throw(error);
    }
    return memberID;
};

/*
get_member_details_by_ID
try to obtain member details, based on MemberID
expects:
    ID;
return:
    a json-object with {Member_Name, Member_Call, Member_Email}
*/
export async function get_member_details_by_ID(params){
    // insert a member that can create a trust
    let errMsg = '';
    let strSQL;

    Trace('Get member details by ID: ', 2);
    Trace('params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (ID) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (ID) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    strSQL = 'SELECT "Member_Name", "Member_Password", "Member_Call", "Member_Email", "Member_Active", "Audit_CreatedBy" FROM trust."Members" WHERE "ID" = $1';

    const result = await query(strSQL, params);
    const rows = result['rows'];
    Trace('Rows: ' + rows);
    return (rows);
};

/*
get_member_details_by_Name
try to obtain member details, based on Member_Name (which is a unique key)
expects:
    Name;
return:
    a json-object with {Member_Name, Member_Call, Member_Email}
*/
export async function get_member_details_by_Name(params){
    // insert a member that can create a trust
    Trace('start: ', 2, 'get member details by name');
    Trace('start params:' + params, 2, 'get member details by name');
    let errMsg;
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (Member Name) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (Member Name) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'Member Name is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    let strSQL;
    strSQL = 'SELECT "ID", "Member_Name", "Member_Password", "Member_Call", "Member_Email", "Member_Active" FROM trust."Members" WHERE "Member_Name" = $1';

    const result = await query(strSQL, params);
    const rows = result['rows'];
    Trace('Rows: ' + rows);
    return (rows);
};

/*
Deactivate member
sets the active state of a member to inactive
Expects:
    ID -- Member ID
returns:
    nothing returned
*/
export async function deactivate_member(params) {
    // as the trust database is insert only !!!
    // insert a new record with the active status set to 'N'
    // TODO - What about the trusts that were added by the Member?
    let errMsg = '';
    let strSQL;

    Trace('Deactivate member: params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (ID) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (ID) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (errMsg !== '') { errMsg = errMsg + ' : ' + params; throw(errMsg);}; // do NOT proceed if the parameters are not matching
    params.push('N'); // inactive

    // strSQL = 'INSERT INTO trust."Members" ("Member_Name", "Member_Password", "Member_Email", "Member_Call", "Member_Active")';
    // strSQL = strSQL + ' SELECT "Member_Name", "Member_Password", "Member_Email", "Member_Call", $2 FROM trust."Members"';
    // strSQL = strSQL + ' WHERE "ID" = $1';
    strSQL = 'UPDATE trust."Members" SET "Member_Active" = $2 WHERE "ID" = $1 ';
    const result = await query(strSQL, params);
    return;
};

/*
Reactivate member
sets the active state of a member to active
Expects:
    ID -- Member ID
returns:
    nothing returned
*/
export async function reactivate_member(params) {
    // as the trust database is insert only !!!
    // insert a new record with the active status set to 'N'
    // TODO - What about the trusts that were added by the Member?
    let errMsg = '';
    let strSQL;

    Trace('Re-activate member: ', 2);
    Trace('params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (ID) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (ID) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching
    params.push('Y'); // active

    // strSQL = 'INSERT INTO trust."Members" ("Member_Name", "Member_Password", "Member_Email", "Member_Call", "Member_Active")';
    // strSQL = strSQL + ' SELECT "Member_Name", "Member_Password", "Member_Email", "Member_Call", $2 FROM trust."Members"';
    // strSQL = strSQL + ' WHERE "ID" = $1';
    strSQL = 'UPDATE trust."Members" SET "Member_Active" = $2 WHERE "ID" = $1 ';
    const result = await query(strSQL, params);
    return;
};

