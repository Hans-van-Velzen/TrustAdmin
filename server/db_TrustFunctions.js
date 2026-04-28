import { query } from "../pgdb/index.js";
import { Trace } from "../utils/Tracer.js";

/*
insert_a_trust
try to insert a new trust into the database
expects:
    Trust name; 
    Trust startdate; -- YYYYMMDD
    CreatedBy
return:
    the Trust_ID of the newly added member-record
*/
export async function insert_a_trust(params){
    // insert a trust
    Trace('insert a trust: ', 2, 'db_TrustFunctions');
    // sanity checking on parameters
    // Member name must not be empty
    let errMsg = '';
    let strSQL;
    if (params.length < 3) {errMsg = '3 parameters expected (Trust name; Trust startdate; CreatedBy - but received only ' + params.length;}
    if (params.length > 3) {errMsg = 'Too many parameters supplied, expected 3 and got ' + params.length;};
    if (params[0] === '') {errMsg = errMsg + 'Trust Name (what is the name of the trust) is empty'};
    if (params[1] === '') {errMsg = errMsg + 'Trust startdate (when did/will this trust start) is empty'};
    if (params[2] === '' || params[2] === undefined) {errMsg = errMsg + 'Created by (who is the member that creates this trust) is empty'};    
    // Trace('insert trust errMsg : "' + errMsg + '"');
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    params.push('Y'); // Trust active
    // params.push();
    Trace('insert a trust-params:' + params, 2, 'db_TrustFunctions');
    strSQL = 'INSERT INTO trust."Trusts" ("Trust_Name", "Trust_Startdate", "Trust_Active", "Audit_CreatedBy") ';
    strSQL = strSQL + 'VALUES($1, $2::date, $4, $3) RETURNING "ID";'
    const result = await query(strSQL, params);
    const TrustID = Number(result['rows'][0]['ID']);
    // console.log(result['fields']);
    Trace('Trust.ID: ' + TrustID, 3, 'insert_a_trust ');
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
    Trace('get_NumberOfTrusts -', 2, 'get_NumberOfTrusts');
    const strSQL = 'SELECT COUNT(1) AS numtrusts FROM trust."Trusts"';
    const params = [];
    const result = await query(strSQL, params);
    Trace(result['rows'][0]['numtrusts']);
    return result['rows'][0]['numtrusts'];
};

/*
get_trust_details_by_ID
try to obtain trust details, based on TrustID
expects:
    ID;
return:
    a json-object with {Trust_Name, Trust_Startdate, Trust_active, Trust_Private, CreatedBy}
*/
export async function get_trust_details_by_ID(params){
    // insert a member that can create a trust
    let errMsg = '';
    let strSQL;

    Trace('Get trust details by ID: ', 2, 'db_TrustFunctions');
    Trace('params:' + params, 2, 'db_TrustFunctions');
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 1) {errMsg = '1 parameters expected (ID) - but received none ';};
    if (params.length > 1) {errMsg = '1 parameters expected (ID) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    strSQL = 'SELECT "ID" as "Trust_ID", "Trust_Name", "Trust_Startdate", "Trust_Active", "Trust_Private", "Audit_CreatedBy" FROM trust."Trusts" WHERE "ID" = $1';

    const result = await query(strSQL, params);
    const rows = result['rows'];
    Trace('Rows: ' + rows, 2, 'db_TrustFunctions');
    return (rows);
};

/*
Deactivate trust
sets the active state of a trust to inactive
Expects:
    ID -- Trust ID
    Issuer -- the trust_party that is in some way involved in the trust
           -- this should be a trustee, maybe make this a two-step process
returns:
    nothing returned
*/
// TODO - make this a two-step process, in case there are more than 1 trustees. Or make it a trust attribute
export async function deactivate_trust(params) {
    let errMsg = '';
    let strSQL;

    Trace('Deactivate trust: params:' + params, 2, 'get_NumberOfTrusts');
    // sanity checking on parameters
    // ID must not be empty
    if (params.length < 2) {errMsg = '2 parameters expected (ID; createdBy) - but received ' + params.length;};
    if (params.length > 2) {errMsg = '2 parameters expected (ID; createdBy) - but received ' + params.length; };
    if (params[0] === '') {errMsg = errMsg + 'ID is empty'};
    if (params[1] === '') {errMsg = errMsg + 'Issuer is empty'};
    if (errMsg !== '') { errMsg = errMsg + ' : ' + params; throw(errMsg);}; // do NOT proceed if the parameters are not matching
    // verify if the Issuer is a known trustee
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

    Trace('get Trusts: params:' + params, 2, 'getTrusts');
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

/*
 Within a trust
 Party related functions
*/

/*
insert_a_party
try to insert a new party into the database
expects:
    Party name;
    Trust_ID;
    Party_Natural;
    Party_bornday;
    Party_Gender;
    Party_Active
    CreatedBy
return:
    the Party_ID of the newly added member-record
*/
export async function insert_a_party(params){
    // insert a party
    Trace('insert a party: ', 2, 'trust functions');
    // sanity checking on parameters
    // Member name must not be empty
    let errMsg = '';
    let strSQL;
    if (params.length < 6) {errMsg = '6 parameters expected (Party_Name", Party_Natural, Party_BornDay, Party_Gender, Party_Active, CreatedBy - but received only ' + params.length;}
    if (params.length > 7) {errMsg = 'Too many parameters supplied, expected 7 and got ' + params.length;};
    if (params[0] === '' || params[0] === undefined) {errMsg = errMsg + ' Party Name (what is the name of the party) is empty. '};
    if (params[1] === '' || params[1] === undefined) {errMsg = errMsg + ' Trust ID, which the party is created for, is empty. '};
    if (params[2] !== 'Y' && params[1] !== 'N') {errMsg = errMsg + 'Party Natural, is the party a natural/biological being, should be Y or N'};
    // if (params[3] === '') A bron day may be empty
    if (params[4]  !== 'man' && params[3]  !== 'woman' && params[3]  !== 'business' && params[3]  !== 'other' ) 
        {errMsg = errMsg + 'the party gender should be either "man"; "woman"; "business" or "other"'};
    if (params[5] !== 'Y' && params[5] !== 'N') {errMsg = errMsg + 'Party Active should be Y or N'};
    if (params[6] === '' || params[6] === undefined) {errMsg = errMsg + 'Created by (who is the member that creates this trust) is empty'};    
    // Trace('insert party errMsg : "' + errMsg + '"');
    if (errMsg !== '') { throw(errMsg);}; // do NOT proceed if the parameters are not matching

    // params.push();
    Trace('insert a party-params:' + params);
    strSQL = 'INSERT INTO trust."Parties" ("Party_Name", "Trust_ID", "Party_Natural", "Party_BornDay", "Party_Gender", "Party_Active", "Audit_CreatedBy") ';
    strSQL = strSQL + 'VALUES($1, $2, $3, $4::date, $5, $6, $7) RETURNING "ID";'
    const result = await query(strSQL, params);
    const PartyID = Number(result['rows'][0]['ID']);
    // console.log(result['fields']);
    Trace('Party.ID: ' + PartyID);
    return PartyID;    
};

// Deactivate party
// Rename a party
// Change bornday
// Change gender