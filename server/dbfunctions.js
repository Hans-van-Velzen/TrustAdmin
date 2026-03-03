import { query } from "../pgdb/index.js";
import { Trace } from "../utils/Tracer.js";

/*
clear the database, empty the tables for a fresh start
*/
export async function clear_database(){
    // reset the entire database
    // console.log('Clear Database');
    let errMsg;
    Trace('Clear Database', 3);
    const params = [];
    let strSQL = 'delete from trust."Trusts";delete from trust."Members";delete from trust."Parties";';
    let result = await query(strSQL, params);
    Trace(result);
    return result;
};

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
    Trace('insert member: params:' + params, 2);
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

    const result = await query(strSQL, params);

    const memberID = result['rows'][0]['ID']
    // console.log(result['fields']);
    Trace('ID: ' + memberID);
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

    strSQL = 'SELECT "Member_Name", "Member_Password", "Member_Call", "Member_Email", "Member_Active" FROM trust."Members" WHERE "ID" = $1';

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
    Trace('insert member: ', 2);
    Trace('params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (Member Name) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (Member Name) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'Member Name is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    let errMsg;
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

/*
insert_a_trust
try to insert a new member into the database
expects:
    Trust name; 
    Trust startdate; -- YYYYMMDD
    CreatedBy
return:
    the Trust_ID of the newly added member-record
*/
export async function insert_a_trust(params){
    // insert a member that can create a trust
    Trace('insert trust: ', 2);
    // sanity checking on parameters
    // Member name must not be empty
    let errMsg = '';
    let strSQL;
    if (params.length < 3) {errMsg = '3 parameters expected (Trust name; Trust startdate; CreatedBy - but received only ' + params.length;}
    if (params.length > 3) {errMsg = 'Too many parameters supplied, expected 3 and got ' + params.length;};
    if (params[0] === '') {errMsg = errMsg + 'Trust Name (what is the name of the trust) is empty'};
    if (params[1] === '') {errMsg = errMsg + 'Trust startdate (when did/will this trust start) is empty'};
    if (params[2] === '') {errMsg = errMsg + 'Created by (who is the member that creates this trust) is empty'};
    // Trace('insert trust errMsg : "' + errMsg + '"');
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    params.push('Y'); // Trust ended
    // params.push();
    Trace('insert a trust-params:' + params);
    strSQL = 'INSERT INTO trust."Trusts" ("Trust_Name", "Trust_Startdate", "Trust_Active", "Audit_CreatedBy") ';
    strSQL = strSQL + 'VALUES($1, $2::date, $4, $3) RETURNING "ID";'
    const result = await query(strSQL, params);
    const TrustID = result['rows'][0]['ID']
    // console.log(result['fields']);
    Trace('Trust.ID: ' + TrustID);
    return TrustID;    
};

/*
get the number of trusts
expects:
    no parameters expected
returns:    
    return the number of trusts
*/
export async function get_NumberOfTrusts ()
{
    Trace('get_NumberOfTrusts -', 2);
    const strSQL = 'SELECT COUNT(1) AS numtrusts FROM trust."Trusts"';
    const params = [];
    const result = await query(strSQL, params);
    Trace(result['rows'][0]['numtrusts']);
    return result['rows'][0]['numtrusts'];
};

/*
Deactivate trust
sets the active state of a trust to inactive
Expects:
    ID -- Trust ID
    Issuer -- the trust_party that is in some way involved in the trust
           -- initially during testing this is the Member
returns:
    nothing returned
*/
export async function deactivate_trust(params) {
    let errMsg = '';
    let strSQL;

    Trace('Deactivate trust: params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 2) {errMsg = '2 parameters expected (ID; createdBy) - but received ' + params.length;};
    if (params.length > 2) {errMsg = '2 parameters expected (ID; createdBy) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (params[1] === '') {errMsg = errMsg + 'Issuer is empty'};
    if (errMsg !== '') { errMsg = errMsg + ' : ' + params; throw(errMsg);}; // do NOT proceed if the parameters are not matching
    params.push('N'); // inactive
    
    strSQL = 'UPDATE trust."Trusts" SET "Trust_Active" = $3 WHERE "ID" = $1 AND "Audit_CreatedBy" = $2';
    const result = await query(strSQL, params);
    return;
};

/*
 * Get_Trusts
 * get the details of a set of trusts
 * Expects:
 * -- issuer - anyone who is stakeholder to the trust
 * Returns:
 * -- set of trusts
*/
export async function getTrusts(params) {
    let errMsg = '';
    let strSQL;

    Trace('get Trusts: params:' + params, 2);
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (createdBy) - but received ' + params.length;};
    if (params.length > 1) {errMsg = '1 parameters expected (createdBy) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'Issuer is empty'};
    if (errMsg !== '') { errMsg = errMsg + ' : ' + params; throw(errMsg);}; // do NOT proceed if the parameters are not matching

    strSQL = 'SELECT * FROM trust."Trusts" WHERE "Audit_CreatedBy" = $1 ';
    const result = await query(strSQL, params);
    return result['rows'];
};