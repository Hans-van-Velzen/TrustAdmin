import { describe, it, assert } from "vitest";
import { expect } from 'vitest'
import {clear_database, get_member_details_by_ID, deactivate_member, 
    getActiveMembers, getInactiveMembers, getTrusts, deactivate_trust } from "../server/dbfunctions.js";
import { insert_a_trust, get_NumberOfTrusts, insert_a_member, getNumberOfMembers } from "../server/dbfunctions.js";
// import { describe, it, before } from 'mocha';
// import {strict as assert} from 'assert';

console.log('============= Start time : ', new Date(), ' =========================');

let NumberOfMembers; 
let NumberOfTrusts;
let Member1_ID, Member2_ID;
let Trust_ID;
// values for a member to be added
let MemberParams = [];
MemberParams.push('Member Name 1');
MemberParams.push('Member password 1');
MemberParams.push('Member1@e.mail')
MemberParams.push('Member calling 1');
MemberParams.push('Y');
// const Member1 = {
//     "Name": "Member Name 1",
//     "Password": "Member password 1",
//     "Email": "Member1@e.mail",
//     "Calling": "Member calling 1",
//     "Active": "Y"
// };
// const Member2 = {
//     "Name": "Member Name 2",
//     "Password": "Member password 2",
//     "Email": "Member2@e.mail",
//     "Calling": "Member calling 2",
//     "Active": "Y"
// }
let TrustParams = [];
TrustParams.push('Trust 1 Name');
TrustParams.push('2024-10-01'); // startdate

let Member2Params = [];
Member2Params.push('Member Name 2');
Member2Params.push('Member password 2');
Member2Params.push('Member2@e.mail')
Member2Params.push('Member calling 2');
Member2Params.push('Y');

let Member;
let ActiveMembers;
let InactiveMembers;
let Trusts;

describe("Database test - Happy path", function () {
    describe("Reset the database", function() {
        it("Should clear the database", async function () {            
            try {
                await clear_database();
                NumberOfMembers = await getNumberOfMembers() ;
            } catch (error) {
                assert(error);
            };
            expect(Number(NumberOfMembers)).toBe(0); //   .to.equal(0);
            try {
                NumberOfTrusts = await get_NumberOfTrusts();
            } catch (error) {
                assert(error);
            }
            expect(Number(NumberOfTrusts)).to.equal(0);        
        });
    });

    describe("Go Happy", function () {
        
        it ("Should allow to add a member", async function () 
        { //console.log(MemberParams);
            try {
                Member1_ID = await insert_a_member(MemberParams);
            } catch (error) { 
                assert(error);
            };
            console.log(Member1_ID);
            expect(Number(Member1_ID)).toBeGreaterThan(0);
            // return Member1_ID;
            return await getNumberOfMembers().then (async function(NumberOfMembers) {
                let params = [Member1_ID];
                expect(Number(NumberOfMembers)).to.equal(1);
                // Check the member details
                Member = await get_member_details_by_ID(params);
                expect(Member.length).toBe(1);
                Member = Member[0];
                console.log(Member);
                expect(Member['Member_Name']).to.equal(MemberParams[0]);
                expect(Member['Member_Active']).to.equal('Y');
                return Member;
            })
        });
    
        it ("Should allow to create a trust", async function() 
        {   // MemberID is known here
            TrustParams.push(Member1_ID);
            console.log(TrustParams);
            try {
                Trust_ID = await insert_a_trust(TrustParams);
            } catch (error) {
                assert(error);
            };
            console.log('Trust_ID: ', Trust_ID);
            expect(Number(Trust_ID)).to.greaterThan(0);
        });
        it ("Should allow to add another member", async function () 
        { 
            try {
                Member2_ID = await insert_a_member(Member2Params);
            } catch (error) {
                assert(error);
            };
            console.log(Member2_ID);
            expect(Number(Member2_ID)).to.greaterThan(0);
            // return Member1_ID;
            return await getNumberOfMembers().then (async function(NumberOfMembers) {
                let params = [Member2_ID];
                expect(Number(NumberOfMembers)).to.equal(2);
                // Check the member details
                Member = await get_member_details_by_ID(params);
                expect(Member.length).to.equal(1);
                Member = Member[0];
                console.log(Member);
                expect(Member['Member_Name']).to.equal(Member2Params[0]);
                expect(Member['Member_Active']).to.equal('Y');
                return Member;
            })
        });
        it("Should allow to deactivate member", async function (){
            // MemberID is known as should be the second member
            let params = [Member2_ID];
            try {
                const res = await deactivate_member(params);   
            } catch (error) {
                assert (error);
            };
            // the call adds another element to the params, so reset it
            params = [Member2_ID];
            try {
                Member = await get_member_details_by_ID(params);}
            catch (error) {
                assert (error);
            };
            
            expect(Member.length).to.equal(1);
            Member = Member[0];
            console.log('deactivate member: ', Member);
            expect(Member['Member_Name']).to.equal(Member2Params[0]);
            expect(Member['Member_Active']).to.equal('N');
            try {
                ActiveMembers = await getActiveMembers();
                InactiveMembers = await getInactiveMembers();
            } catch (error) {
                assert (error);
            };
            console.log('active members: ', ActiveMembers);
            console.log('Inactive members: ', InactiveMembers);
            assert(ActiveMembers.length === 1, 'Active Members should be 1');
            const Member1 = ActiveMembers[0];
            assert(Member1['Member_Name'] === MemberParams[0], 'Active Member name should be ' + MemberParams[0]);
            assert(InactiveMembers.length === 1, 'Inactive Members should be 1');
            assert(InactiveMembers[0]['Member_Name'] === Member2Params[0], 'Inactive member name should be ' + Member2Params[0]);

            return Member;
        });
        it ('Should allow to close a trust', async function() {
            // Trust_ID is known
            let params;
            let res;
            try {
                params = [Trust_ID, Member1_ID];
                res = await deactivate_trust(params);
                params = [Member1_ID];

                Trusts = await getTrusts(params);
            } catch (error) {
                assert (error);
            };
            console.log('Trusts: ' + Trusts);            

        })
    });
    // })

});