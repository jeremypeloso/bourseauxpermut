-- Référentiel complet : corps et grades des trois institutions, un service de base par département,
-- et possibilité pour l'agent d'ajouter une affectation absente (champ libre encadré).

-- Corps supplémentaires
insert into corps values
 ('PA','PN','Policiers adjoints'), ('PTS','PN','Police technique et scientifique'),
 ('CSTAGN','GN','Corps de soutien technique et administratif'),
 ('DIR','AP','Directeurs des services pénitentiaires'), ('DPIP','AP','Directeurs pénitentiaires d''insertion et de probation')
on conflict (code) do nothing;

-- Grades (rang = ordre hiérarchique)
insert into grades values
 -- Police nationale
 ('PAD','PA','Policier adjoint',0),
 ('EGPX','CEA','Élève gardien de la paix',0),('GPX','CEA','Gardien de la paix',1),('BRG','CEA','Brigadier',2),('BRC','CEA','Brigadier-chef',3),
 ('MAJ','CEA','Major',4),('MRULP','CEA','Major responsable d''unité locale de police',5),('MEX','CEA','Major à l''échelon exceptionnel',6),
 ('LTN','CC','Lieutenant',1),('CNE','CC','Capitaine',2),('CDT','CC','Commandant',3),('CDD','CC','Commandant divisionnaire',4),('CDDF','CC','Commandant divisionnaire fonctionnel',5),
 ('CRE','CCD','Commissaire',1),('CRD','CCD','Commissaire divisionnaire',2),('CRG','CCD','Commissaire général',3),('CTG','CCD','Contrôleur général',4),('IG','CCD','Inspecteur général',5),
 ('ASPTS','PTS','Agent spécialisé de police technique et scientifique',1),('TPTS','PTS','Technicien de police technique et scientifique',2),('TPPTS','PTS','Technicien principal',3),('IPTS','PTS','Ingénieur de police technique et scientifique',4),
 -- Gendarmerie nationale
 ('GAV2','GAV','Gendarme adjoint volontaire',0),('GAVB','GAV','Gendarme adjoint brigadier',1),('GAVBC','GAV','Gendarme adjoint brigadier-chef',2),
 ('GEN','SOG','Gendarme',1),('MDL','SOG','Maréchal des logis-chef',2),('ADJ','SOG','Adjudant',3),('ADC','SOG','Adjudant-chef',4),('MAJG','SOG','Major',5),
 ('SLT','OFF','Sous-lieutenant',1),('LTNG','OFF','Lieutenant',2),('CNEG','OFF','Capitaine',3),('CEN','OFF','Chef d''escadron',4),('LCL','OFF','Lieutenant-colonel',5),('COL','OFF','Colonel',6),('GBR','OFF','Général',7),
 ('CSTB','CSTAGN','Brigadier CSTAGN',1),('CSTMDL','CSTAGN','Maréchal des logis-chef CSTAGN',2),('CSTADJ','CSTAGN','Adjudant CSTAGN',3),('CSTADC','CSTAGN','Adjudant-chef CSTAGN',4),('CSTMAJ','CSTAGN','Major CSTAGN',5),
 -- Administration pénitentiaire
 ('ESUR','SURV','Élève surveillant',0),('SUR','SURV','Surveillant',1),('SUB','SURV','Surveillant brigadier',2),('PRE','SURV','Premier surveillant',3),('MAJP','SURV','Major',4),
 ('LTNP','OFFAP','Lieutenant pénitentiaire',1),('CNEP','OFFAP','Capitaine pénitentiaire',2),('CDTP','OFFAP','Commandant pénitentiaire',3),
 ('CPIP1','CPIP','CPIP',1),('CPIPC','CPIP','CPIP de classe exceptionnelle',2),
 ('DPIP1','DPIP','DPIP',1),('DPIPHC','DPIP','DPIP hors classe',2),
 ('DSP','DIR','Directeur des services pénitentiaires',1),('DSPHC','DIR','DSP hors classe',2)
on conflict (code) do nothing;

-- Un service de base par département et par institution (chef-lieu), pour que chaque département soit sélectionnable
with pref(dep, ville, lat, lng) as (values
 ('01','Bourg-en-Bresse',46.2,5.23),('02','Laon',49.56,3.62),('03','Moulins',46.57,3.34),('04','Digne-les-Bains',44.09,6.24),('05','Gap',44.56,6.08),('06','Nice',43.7,7.27),('07','Privas',44.73,4.59),('08','Charleville-Mézières',49.77,4.72),('09','Foix',42.96,1.6),('10','Troyes',48.3,4.07),
 ('11','Carcassonne',43.21,2.35),('12','Rodez',44.35,2.57),('13','Marseille',43.3,5.37),('14','Caen',49.18,-0.36),('15','Aurillac',44.93,2.44),('16','Angoulême',45.65,0.16),('17','La Rochelle',46.16,-1.15),('18','Bourges',47.08,2.4),('19','Tulle',45.27,1.77),('21','Dijon',47.32,5.04),
 ('22','Saint-Brieuc',48.51,-2.76),('23','Guéret',46.17,1.87),('24','Périgueux',45.18,0.72),('25','Besançon',47.24,6.02),('26','Valence',44.93,4.89),('27','Évreux',49.02,1.15),('28','Chartres',48.44,1.49),('29','Quimper',48.0,-4.1),('2A','Ajaccio',41.93,8.74),('2B','Bastia',42.7,9.45),
 ('30','Nîmes',43.84,4.36),('31','Toulouse',43.6,1.44),('32','Auch',43.65,0.59),('33','Bordeaux',44.84,-0.58),('34','Montpellier',43.61,3.88),('35','Rennes',48.11,-1.68),('36','Châteauroux',46.81,1.69),('37','Tours',47.39,0.69),('38','Grenoble',45.19,5.72),('39','Lons-le-Saunier',46.67,5.56),
 ('40','Mont-de-Marsan',43.89,-0.5),('41','Blois',47.59,1.33),('42','Saint-Étienne',45.43,4.39),('43','Le Puy-en-Velay',45.04,3.88),('44','Nantes',47.22,-1.55),('45','Orléans',47.9,1.9),('46','Cahors',44.45,1.44),('47','Agen',44.2,0.62),('48','Mende',44.52,3.5),('49','Angers',47.47,-0.55),
 ('50','Saint-Lô',49.12,-1.09),('51','Châlons-en-Champagne',48.96,4.37),('52','Chaumont',48.11,5.14),('53','Laval',48.07,-0.77),('54','Nancy',48.69,6.18),('55','Bar-le-Duc',48.77,5.16),('56','Vannes',47.66,-2.76),('57','Metz',49.12,6.18),('58','Nevers',46.99,3.16),('59','Lille',50.63,3.06),
 ('60','Beauvais',49.43,2.08),('61','Alençon',48.43,0.09),('62','Arras',50.29,2.78),('63','Clermont-Ferrand',45.78,3.09),('64','Pau',43.3,-0.37),('65','Tarbes',43.23,0.07),('66','Perpignan',42.7,2.9),('67','Strasbourg',48.58,7.75),('68','Colmar',48.08,7.36),('69','Lyon',45.76,4.83),
 ('70','Vesoul',47.62,6.15),('71','Mâcon',46.31,4.84),('72','Le Mans',48.0,0.2),('73','Chambéry',45.57,5.92),('74','Annecy',45.9,6.13),('75','Paris',48.86,2.35),('76','Rouen',49.44,1.1),('77','Melun',48.54,2.66),('78','Versailles',48.8,2.13),('79','Niort',46.32,-0.46),
 ('80','Amiens',49.9,2.3),('81','Albi',43.93,2.15),('82','Montauban',44.02,1.36),('83','Toulon',43.12,5.93),('84','Avignon',43.95,4.81),('85','La Roche-sur-Yon',46.67,-1.43),('86','Poitiers',46.58,0.34),('87','Limoges',45.83,1.26),('88','Épinal',48.17,6.45),('89','Auxerre',47.8,3.57),
 ('90','Belfort',47.64,6.86),('91','Évry',48.63,2.44),('92','Nanterre',48.89,2.2),('93','Bobigny',48.91,2.45),('94','Créteil',48.79,2.47),('95','Cergy',49.03,2.08),
 ('971','Basse-Terre',16.0,-61.73),('972','Fort-de-France',14.6,-61.07),('973','Cayenne',4.93,-52.33),('974','Saint-Denis',-20.88,55.45),('976','Mamoudzou',-12.78,45.23),('975','Saint-Pierre',46.78,-56.17),('988','Nouméa',-22.27,166.44),('987','Papeete',-17.53,-149.57)
)
insert into services (institution, ville, departement, type, libelle, outre_mer, lat, lng)
select i.code, p.ville, p.dep,
  case i.code when 'PN' then 'CSP' when 'GN' then 'GGD' else 'EP' end,
  case i.code when 'PN' then 'CSP ' || p.ville when 'GN' then 'Groupement ' || p.dep || ' (' || p.ville || ')' else 'Établissement pénitentiaire · ' || p.ville end,
  p.dep like '97%' or p.dep like '98%', p.lat, p.lng
from pref p cross join institutions i
where not exists (select 1 from services s where s.institution = i.code and s.departement = p.dep and s.ville = p.ville and s.type = case i.code when 'PN' then 'CSP' when 'GN' then 'GGD' else 'EP' end);

-- Services ajoutés par les agents (affectation absente du référentiel) : traçabilité, modération possible
alter table services add column if not exists ajoute_par uuid references profils(id) on delete set null;
alter table services add column if not exists valide boolean not null default true;
