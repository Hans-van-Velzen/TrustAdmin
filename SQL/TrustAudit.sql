-- audit.logged_actions definition

-- Drop table

-- DROP TABLE audit.logged_actions;

CREATE TABLE trust_audit.logged_actions (
	event_id bigserial NOT NULL,
	schema_name text NOT NULL,
	table_name text NOT NULL,
	key_value jsonb NULL,
	"action" text NOT NULL,
	before_fields jsonb NULL,
	after_fields jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_by text NULL,
	client_query text NULL,
	statement_query text NULL,
	CONSTRAINT logged_actions_action_check CHECK ((action = ANY (ARRAY['I'::text, 'D'::text, 'U'::text, 'T'::text]))),
	CONSTRAINT logged_actions_pkey PRIMARY KEY (event_id)
);

set role trust;

GRANT INSERT, SELECT ON TABLE trust_audit.logged_actions TO trust;

GRANT ALL ON FUNCTION trust_audit.audit_trigger() TO trust;

-- call this function from every table you want audited
-- DROP FUNCTION trust_audit.audit_trigger();

CREATE OR REPLACE FUNCTION trust_audit.audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_data jsonb;
    old_data jsonb;
	config jsonb = TG_ARGV[0];
    key text;
    new_values jsonb;
    old_values jsonb;
    user_id text;
    key_values jsonb;
	triggered_action char(1);
	id_value text;
BEGIN
--config jsonb = TG_ARGV[0];

    user_id := current_setting('audit.user_id', true);
	id_value = config->>'id_value'; -- this should be a variable, allowing for specific column names

RAISE NOTICE 'Value: %', id_value;

    IF user_id IS NULL THEN
        user_id := current_user;
    END IF;

    new_values := '{}';
    old_values := '{}';

    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        new_values := new_data;
		key_values = to_jsonb(new_data ->> id_value); 
		-- set the key_values
		triggered_action = 'I';
        -- audit_row.id_value = js_new_all->>id_value


    ELSIF TG_OP = 'UPDATE' THEN
        new_data := to_jsonb(NEW);
        old_data := to_jsonb(OLD);
		triggered_action = 'U';
        
		key_values = to_jsonb(new_data ->> id_value);  

        FOR key IN SELECT jsonb_object_keys(new_data) INTERSECT SELECT jsonb_object_keys(old_data)
        LOOP
            IF new_data ->> key != old_data ->> key THEN
                new_values := new_values || jsonb_build_object(key, new_data ->> key);
                old_values := old_values || jsonb_build_object(key, old_data ->> key);
            END IF;
        END LOOP;

    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        old_values := old_data;
		triggered_action = 'D';
		key_values = to_jsonb(old_data ->> id_value); 

        FOR key IN SELECT jsonb_object_keys(old_data)
        LOOP
            old_values := old_values || jsonb_build_object(key, old_data ->> key);
        END LOOP;

    END IF;

    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
		INSERT INTO trust_audit.logged_actions (schema_name, table_name, key_value, "action", updated_by, before_fields, after_fields)
        VALUES ('zoom', TG_TABLE_NAME, key_values /*record_id*/, triggered_action, user_id, old_values, new_values);

        RETURN NEW;
    ELSE
        INSERT INTO trust_audit.logged_actions (schema_name, table_name, key_value, "action", updated_by, before_fields, after_fields)
        VALUES ('zoom', TG_TABLE_NAME, key_values, triggered_action, user_id, old_values, new_values);

        RETURN OLD;
    END IF;
END;
$function$
;

/*
-- this is part of the TrustAdmin.sql
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Members"
    FOR EACH ROW
    EXECUTE FUNCTION audit.audit_trigger()
    ;

   
CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."People"
    FOR EACH ROW
    EXECUTE FUNCTION audit.audit_trigger()
    ;


CREATE TRIGGER audit_log_trigger
    BEFORE INSERT OR UPDATE OR DELETE 
 ON trust."Trusts"
    FOR EACH ROW
    EXECUTE FUNCTION audit.audit_trigger()
    ;
*/