create table trust
( TrustID bigserial primary key
, TrustName varchar(64) not null
, TrustStartdate date
);

-- drop table people
create table people
( PeopleID bigserial primary key
, PeopleName varchar(100) unique
);


--drop table Trustees
create table Trustees
( Trustees_ID bigserial primary key
, TrustID bigint
, PeopleID bigint
, CONSTRAINT Trustees__uk UNIQUE (TrustID, PeopleID)
);

--drop table Beneficiaries
create table Beneficiaries
( Beneficiaries_ID bigserial primary key
, TrustID bigint
, PeopleID bigint
, CONSTRAINT Beneficiaries__uk UNIQUE (TrustID, PeopleID)
);

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
)
