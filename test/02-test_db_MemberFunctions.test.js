import { describe, it, assert } from "vitest";
import { expect } from 'vitest'
import { clear_database, get_member_details_by_ID, deactivate_member, 
    getActiveMembers, getInactiveMembers } from "../server/dbfunctions.js";
import { insert_a_member, getNumberOfMembers, get_member_details_by_Name } from "../server/dbfunctions.js";
import { Trace } from "../utils/Tracer.js";

let NumberOfMembers;
let Member1_ID, Member2_ID;

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

describe('Testing Member related functions', () => {
    
    describe("Reset the database", function() {
        it("Should clear the database", async function () {            
            try {
                await clear_database();
                NumberOfMembers = await getNumberOfMembers() ;
            } catch (error) {
                assert(error);
            };
            expect(Number(NumberOfMembers)).toBe(0); //   .to.equal(0);
            // try {
            //     NumberOfTrusts = await get_NumberOfTrusts();
            // } catch (error) {
            //     assert(error);
            // }
            // expect(Number(NumberOfTrusts)).to.equal(0);        
        });
    });

    it("prepare the starting position", async function () {
        // this is tested in happy path
        try {
            Member1_ID = await insert_a_member(Member1Params);
            Trace ('Member1_ID ' + Member1_ID, 2, 'starting')
        }
        catch (error) {
            Trace(error);
        };

    });
    it ('should not allow to add a member with already existing name', async function () {
        // const memID = insert_a_member(Member1Params);
        // Trace(memID, 2, 'test - 2')
        // const Name = await get_member_details_by_Name(Member1Params[0]);
        // Trace(Name, 1, 'doubeltest')
        const DoubleName = async () => insert_a_member(Member1Params)

        // expect(DoubleName).toThrowError()
        await expect(DoubleName).rejects.toThrow(/duplicate/)
    });
})