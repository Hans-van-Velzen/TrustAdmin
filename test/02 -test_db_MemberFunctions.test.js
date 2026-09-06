import { describe, it, assert } from "vitest";
import { expect } from 'vitest'
import { clear_database } from "../server/dbfunctions.js";
import { get_member_details_by_ID, deactivate_member, getNumberOfMembers,
         getActiveMembers, getInactiveMembers, insert_a_member } from "../server/db_MemberFunctions.js";
import { Trace } from "../utils/Tracer.js";

let NumberOfMembers;
let Member1_ID, Member2_ID;
let Trust1_ID, Trust2_ID;

let Member1Params = [];
Member1Params.push('Member Name 1');
Member1Params.push('Member password 1');
Member1Params.push('Member1@e.mail')
Member1Params.push('Member calling 1');
Member1Params.push('Y');

let Member2Params = [];
Member2Params.push('Member Name 2');
Member2Params.push('Member password 2');
Member2Params.push('Member2@e.mail')
Member2Params.push('Member calling 2');
Member2Params.push('Y');

let Trust1Params = [];
Trust1Params.push('Trust 1 Name');
Trust1Params.push('2026-02-02');


describe('Testing Member related functions', () => {
    
    describe("Reset the database", function() {
        it("Should clear the database", async function () {            
            try {
                await clear_database();
                NumberOfMembers = await getNumberOfMembers() ;
            } catch (error) {
                assert(error);
            };
            expect(Number(NumberOfMembers)).toBe(0);    
        });
    });

    it("prepare the starting position", async function () {
        // this is tested in happy path
        try {
            Member1_ID = await insert_a_member(Member1Params);
            Trace ('Member1_ID ' + Member1_ID, 2, 'starting');
            Member2_ID = await insert_a_member(Member2Params);
            Trace ('Member2_ID ' + Member2_ID, 2, 'starting');
        }
        catch (error) {
            Trace(error);
        };

    });
    it ('should not allow to add a member with already existing name', async function () {
        const DoubleName = async () => insert_a_member(Member1Params)

        // expect(DoubleName).toThrowError()
        await expect(DoubleName).rejects.toThrow(/duplicate/);
    });

    // it('should allow to add a trust', async function () {
    //     Trust1Params.push(Member1_ID); // add the one who inserts the trust record

    //     try {
    //         Trust1_ID = await insert_a_trust(Trust1Params);
    //     } catch (error) {
    //         Trace(error);
    //         throw error;
    //     }

    //     expect(Trust1_ID).toBeTypeOf("number");
    // });
    // it('should not allow to add another trust with the same name', async function() {
    //     const DoubleTrust = async () => insert_a_trust(Trust1Params);

    //     await expect(DoubleTrust).rejects.toThrowError();
    // });
    // it('should allow to add another trust, with the same name, from anothe rmember', async function() {
    //     // set the member to Member2_ID
    //     Trust1Params[Trust1Params.length] = Member2_ID;
    //     try {
    //         Trust2_ID = await insert_a_trust(Trust1Params);
    //     } catch (error) {
    //         Trace(error);
    //         throw error;
    //     }

    //     expect(Trust2_ID).toBeTypeOf("number");
    // });
});