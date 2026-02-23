-- trust."Members" definition

-- Drop table

-- DROP TABLE trust."Members" cascade;

CREATE TABLE trust."Members" (
	"ID" bigserial NOT NULL,
	"Member_Name" varchar(128) NOT NULL,
	"Member_Email" varchar(128) NOT NULL,
	"Member_Password" varchar(128) NOT NULL,
	"Member_Call" varchar(128) NULL,
	"Member_Active" bpchar(1) DEFAULT 'Y'::bpchar NULL,
	"Audit_CreatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT chk_member_active CHECK (("Member_Active" = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT chk_member_pw_len CHECK ((length(("Member_Password")::text) > 6)),
	CONSTRAINT member__uk UNIQUE ("Member_Name"),
	CONSTRAINT members_pkey PRIMARY KEY ("ID")
);

-- Table Triggers
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Members"
    FOR EACH ROW
    EXECUTE FUNCTION trust_audit.audit_trigger()
    ;

-- drop table Trusts; 
-- trust."Trusts" definition

-- Drop table

-- DROP TABLE trust."Trusts" cascade;

CREATE TABLE trust."Trusts" (
	"ID" bigserial NOT NULL,
	"Trust_Name" varchar(64) NOT NULL,
	"Trust_Startdate" date NULL,
	"Trust_Active" bpchar(1) DEFAULT 'Y'::bpchar NOT NULL,
	"Audit_CreatedBy" int8 NULL,
	"Audit_CreatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "Trusts__chk_Active" CHECK (("Trust_Active" = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT "Trusts__pkey" PRIMARY KEY ("ID"),
	CONSTRAINT "Trusts__uk" UNIQUE ("Trust_Name", "Audit_CreatedBy")
);
-- foreign keys
ALTER TABLE trust."Trusts" ADD CONSTRAINT trusts_auditcreatedby_fkey FOREIGN KEY ("Audit_CreatedBy") REFERENCES trust."Members"("ID");

-- Table Triggers

CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Trusts"
    FOR EACH ROW
    EXECUTE FUNCTION trust_audit.audit_trigger();

-- trust."Parties" definition

-- Drop table

-- DROP TABLE trust."Parties";

CREATE TABLE trust."Parties" (
	"ID" bigserial NOT NULL,
	"Party_Name" varchar(100) NOT NULL,
	"Party_Natural" bpchar(1) DEFAULT 'Y'::bpchar NOT NULL,
	"Party_BornDay" date NULL,
	"Party_Gender" bpchar(10) NULL,
    "Party_Active"  bpchar(1) DEFAULT 'Y'::bpchar NOT NULL,
	"Audit_CreatedBy" int8 NULL,
	"Audit_CreatedAt" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "Chk_PartyGender" CHECK (("Party_Gender" = ANY (ARRAY['man'::bpchar, 'woman'::bpchar, 'business'::bpchar, 'other'::bpchar]))),
	CONSTRAINT "Chk_PartyNatural" CHECK (("Party_Natural" = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT "Parties__pkey" PRIMARY KEY ("ID"),
	CONSTRAINT "Parties__uk" UNIQUE ("Party_Name", "Party_BornDay")
);
-- foreign keys
ALTER TABLE trust."Parties" ADD CONSTRAINT parties_auditcreatedby_fkey FOREIGN KEY ("Audit_CreatedBy") REFERENCES trust."Members"("ID");

-- Table Triggers
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Parties"
    FOR EACH ROW
    EXECUTE FUNCTION trust_audit.audit_trigger();


-- drop table "Trustees";
create table "Trustees"(
    "ID" bigserial primary key,
    "Trust_ID" bigint,
    "Party_ID" bigint,
	"Audit_CreatedBy" int8 NULL,
	"Audit_CreatedAt" timestamptz DEFAULT now() NOT null,
    CONSTRAINT "Trustees__uk" UNIQUE ("Trust_ID", "Party_ID")
);

-- foreign keys
ALTER TABLE trust."Trustees" ADD CONSTRAINT trustees_auditcreatedby_fkey FOREIGN KEY ("Audit_CreatedBy") REFERENCES trust."Members"("ID");
ALTER TABLE trust."Trustees" ADD CONSTRAINT trustees_trust_fkey FOREIGN KEY ("Trust_ID") REFERENCES trust."Trusts"("ID");
ALTER TABLE trust."Trustees" ADD CONSTRAINT trustees_party_fkey FOREIGN KEY ("Party_ID") REFERENCES trust."Parties"("ID");

-- table triggers
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Trustees"
    FOR EACH ROW
    EXECUTE FUNCTION trust_audit.audit_trigger();

-- insert or delete or update on
--     trust.Trustees for each row execute function trust_audit.audit_trigger('{"id_value": "Trustees_ID"}');

--drop table "Beneficiaries"
create table "Beneficiaries"(
    "ID" bigserial primary key,
    "Trust_ID" bigint,
    "Party_ID" bigint,
    "Audit_CreatedBy" int8 NULL,
	"Audit_CreatedAt" timestamptz DEFAULT now() NOT null,
    CONSTRAINT "Beneficiaries__uk" UNIQUE ("Trust_ID", "Party_ID")
);

-- foreign keys
ALTER TABLE trust."Beneficiaries" ADD CONSTRAINT beneficiaries_auditcreatedby_fkey FOREIGN KEY ("Audit_CreatedBy") REFERENCES trust."Members"("ID");
ALTER TABLE trust."Beneficiaries" ADD CONSTRAINT beneficiaries_trust_fkey FOREIGN KEY ("Trust_ID") REFERENCES trust."Trusts"("ID");
ALTER TABLE trust."Beneficiaries" ADD CONSTRAINT beneficiaries_party_fkey FOREIGN KEY ("Party_ID") REFERENCES trust."Parties"("ID");

-- table triggers
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Beneficiaries"
    FOR EACH ROW
    EXECUTE FUNCTION trust_audit.audit_trigger();

-- insert or delete or update on
--     trust."Beneficiaries" for each row execute function trust_audit.audit_trigger('{"id_value": "Beneficiaries_ID"}');

create table TrustDocs
( TrustDocID bigserial primary key
, DocName varchar(128)
, SentReceived char(8)
, DocDate date   -- The date a document was received or sent
, DocLink varchar(256) -- a link to the actual document
, DocFromOrg varchar(128)
, DocFromName varchar(128)
, DocToOrg varchar(128)
, DocToName varchar(128)
, DocTrackTrace varchar(32) -- holds a track and tracecode
, DocDateReceivedAtAddressee date -- for sent documents, when was it received
);

create trigger audit_log_trigger before
insert
    or
delete
    or
update
    on
    trust.TrustDocs for each row execute function trust_audit.audit_trigger('{"id_value": "TrustDocID"}');

-- Drop table
-- DO NOT USE

-- DROP TABLE trust."Trust_Parties";

-- CREATE TABLE trust."Trust_Parties" (
-- 	"ID" bigserial NOT NULL,
-- 	"Trust_ID" int8 not null,
-- 	"Party_Name" varchar(100) NOT NULL,
-- 	"Party_Natural" bpchar(1) DEFAULT 'Y'::bpchar NOT NULL,
-- 	"Party_BornDay" date NULL,
-- 	"Party_Gender" bpchar(10) NULL,
-- 	"Audit_CreatedBy" int8 NULL,
-- 	"Audit_CreatedAt" timestamptz DEFAULT now() NOT NULL,
-- 	CONSTRAINT "Chk_PartyGender" CHECK (("Party_Gender" = ANY (ARRAY['man'::bpchar, 'woman'::bpchar, 'business'::bpchar, 'other'::bpchar]))),
-- 	CONSTRAINT "Chk_PartyNatural" CHECK (("Party_Natural" = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
-- 	CONSTRAINT "Trust_Parties__pkey" PRIMARY KEY ("ID"),
-- 	CONSTRAINT "trust_Parties__uk" UNIQUE ("Trust_ID", "Party_Name", "Party_BornDay")
-- );

-- -- Table Triggers

-- create trigger audit_log_trigger before
-- insert
--     or
-- delete
--     or
-- update
--     on
--     trust."Trust_Parties" for each row execute function audit.audit_trigger();


-- -- trust."Trust_Parties" foreign keys

-- ALTER TABLE trust."Trust_Parties" ADD CONSTRAINT trust_parties_auditcreatedby_fkey FOREIGN KEY ("Audit_CreatedBy") REFERENCES trust."Members"("ID");
-- ALTER TABLE trust."Trust_Parties" ADD CONSTRAINT trust_parties_trust_fkey FOREIGN KEY ("Trust_ID") REFERENCES trust."Trusts"("ID");

