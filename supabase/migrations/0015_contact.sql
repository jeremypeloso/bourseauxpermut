-- Contact de mise en relation (chiffré) : téléphone et email de contact, révélés seulement après accord de tous.
alter table identites add column if not exists contact_email_enc text;
alter table identites alter column nom_enc drop not null;
alter table identites alter column prenom_enc drop not null;
alter table identites alter column mail_pro_enc drop not null;
