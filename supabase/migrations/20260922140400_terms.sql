-- The first terms version, so sign up has something to accept.
-- The wording itself is DS01 in packages/content. This row records the
-- version, not the text.
--
-- O10 still requires a lawyer to review the terms and disclaimers before
-- public launch. This version exists for internal use.

insert into public.terms_versions (version, is_material, content_url)
values ('1.0.0', true, '/legal/terms')
on conflict (version) do nothing;
