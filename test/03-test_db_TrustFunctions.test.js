import { describe, it, assert } from "vitest";
import { expect, beforeAll } from 'vitest'
import { clear_database } from "./00 - clear test database.js";
import { get_member_details_by_ID, deactivate_member, getNumberOfMembers,
         getActiveMembers, getInactiveMembers, insert_a_member } from "../server/db_MemberFunctions.js";
import { insert_a_trust, get_NumberOfTrusts, deactivate_trust, getTrusts, insert_a_party, get_trust_details_by_ID } from "../server/db_TrustFunctions.js";
import { Trace } from "../utils/Tracer.js";

beforeAll(() => {
    global.Member1_ID = undefined;
    global.Member2_ID = undefined;
    global.Trust1_ID = undefined;
    global.Trust2_ID = undefined;
    global.Party1_ID = undefined;
})

describe('Testing Trust related functions', () => {
    let NumberOfMembers;

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

    let Trust2Params = [];
    Trust2Params.push('Trust 2 Name');
    Trust2Params.push('2026-03-02');

    let Trust3Params = [];
    Trust3Params.push('Trust 3 Name');
    Trust3Params.push('2026-03-02');

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

        it("prepares the starting position", async function ({ task }) {
            try {
                let MemberID;
                // global.Member1_ID = await insert_a_member(Member1Params);
                MemberID = await insert_a_member(Member1Params);
                global.Member1_ID = MemberID
                Trace ('Member1_ID ' + global.Member1_ID, 2, task.name + 'starting');
                // global.Member2_ID = await insert_a_member(Member2Params);
                global.Member2_ID = await insert_a_member(Member2Params);
                Trace ('Member2_ID ' + global.Member2_ID, 2, task.name + 'starting');
            }
            catch (error) {
                Trace(error);
            };
        });

        // it ("reports the current total state", async function ({task, Member1_ID}) {
        //     Trace('Member-IDs -', 2, task.name);
        //     Trace('Member-1ID -', 2, global.Member1_ID);
        //     Trace('Member-2ID -', 2, global.Member2_ID);
        //     Trace('Member-1ID -', 2, Member1_ID);
        // });
    });

    it('should allow to add a trust', async function ({ task }) {
        Trace('insert a trust - member ID ' + Member1_ID, 2, task.name);

        Trust1Params.push(global.Member1_ID); // add the one who inserts the trust record
        let trust1Data;

        try {
            global.Trust1_ID = await insert_a_trust(Trust1Params);
        } catch (error) {
            Trace(error);
            throw error;
        }

        expect(global.Trust1_ID).toBeTypeOf("number");
        // now retrieve the trust data and verify the createdBY
        let params = [];
        params.push(global.Trust1_ID);
        try {
            trust1Data = await get_trust_details_by_ID(params);
            console.log('Trustdata: ', trust1Data[0] ); //.Audit_CreatedBy);
            // Trace('Trustdata: ' + trust1Data, 2, task.name);
        } catch (error) 
        {
            Trace(error, 1, task.name);
            throw error;
        };
        // Trace('Test values 1: ' + trust1Data[0].Audit_CreatedBy, 2, task.name);
        // Trace('Test values 2: ' + global.Member1_ID, 2, task.name);
        expect (trust1Data[0].Audit_CreatedBy).toBe(global.Member1_ID);

    });
    it('should not allow to add another trust with the same name and same member', async function() {
        const DoubleTrust = async () => insert_a_trust(Trust1Params);

        await expect(DoubleTrust).rejects.toThrowError();
    });

    it('should allow to add another trust, with the same name, from another member', async function() {
        // set the member to Member2_ID
        console.log('Insert same trust with other member', Trust1Params);
        Trust1Params.pop(); // somehow the raw set gets screwed up.
        Trust1Params[Trust1Params.length-1] = global.Member2_ID;
        try {
            global.Trust2_ID = await insert_a_trust(Trust1Params);
        } catch (error) {
            Trace(error);
            throw error;
        }

        expect(global.Trust2_ID).toBeTypeOf("number");
    });

    it('should allow to add a Party', async function( {task}) {
        let PartyParams = [];

        PartyParams.push('Party1 name');
        PartyParams.push(global.Trust1_ID);
        PartyParams.push('Y');
        PartyParams.push('20010507');
        PartyParams.push('man');
        PartyParams.push('Y');
        PartyParams.push (Member1_ID);
        try {
            Party1_ID = await insert_a_party(PartyParams);
        } catch (error) {
            Trace(error);
            throw error;
        }
    });
});