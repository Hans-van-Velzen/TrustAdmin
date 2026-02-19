# TrustAdmin
Support for trust administration

- become a member
- logon
- add trusts
- maintain trusts
-- add documents
-- maintain beneficiaries
-- maintain trustees
-- add ledger entries

Database prerequisite
```sql
create database trust

-- DROP ROLE trust;

CREATE ROLE trust SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN NOREPLICATION NOBYPASSRLS PASSWORD '[STRONG RANDOM PASSWORD]';
COMMENT ON ROLE trust IS 'role/user for the maintenance of trust-admin';

ALTER ROLE trust IN DATABASE trust SET search_path="$user", trust, public;

-- DROP SCHEMA trust;

CREATE SCHEMA trust AUTHORIZATION trust;

-- DROP SCHEMA audit;
CREATE SCHEMA audit AUTHORIZATION trust;
```