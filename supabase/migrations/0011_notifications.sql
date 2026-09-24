-- Trace des mails de notification (un seul mail par membre et par correspondance)
alter table correspondance_membres add column if not exists mail_envoye_le timestamptz;
