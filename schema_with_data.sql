--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."saved_vehicles" DROP CONSTRAINT IF EXISTS "saved_vehicles_vehicle_id_vehicles_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."saved_vehicles" DROP CONSTRAINT IF EXISTS "saved_vehicles_user_id_users_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."inquiries" DROP CONSTRAINT IF EXISTS "inquiries_vehicle_id_vehicles_id_fk";
ALTER TABLE IF EXISTS ONLY "public"."vehicles" DROP CONSTRAINT IF EXISTS "vehicles_vin_unique";
ALTER TABLE IF EXISTS ONLY "public"."vehicles" DROP CONSTRAINT IF EXISTS "vehicles_pkey";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_username_unique";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE IF EXISTS ONLY "public"."testimonials" DROP CONSTRAINT IF EXISTS "testimonials_pkey";
ALTER TABLE IF EXISTS ONLY "public"."saved_vehicles" DROP CONSTRAINT IF EXISTS "saved_vehicles_user_id_vehicle_id_unique";
ALTER TABLE IF EXISTS ONLY "public"."saved_vehicles" DROP CONSTRAINT IF EXISTS "saved_vehicles_pkey";
ALTER TABLE IF EXISTS ONLY "public"."inquiries" DROP CONSTRAINT IF EXISTS "inquiries_pkey";
ALTER TABLE IF EXISTS "public"."vehicles" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."users" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."testimonials" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."saved_vehicles" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."inquiries" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "public"."vehicles_id_seq";
DROP TABLE IF EXISTS "public"."vehicles";
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
DROP TABLE IF EXISTS "public"."users";
DROP SEQUENCE IF EXISTS "public"."testimonials_id_seq";
DROP TABLE IF EXISTS "public"."testimonials";
DROP SEQUENCE IF EXISTS "public"."saved_vehicles_id_seq";
DROP TABLE IF EXISTS "public"."saved_vehicles";
DROP SEQUENCE IF EXISTS "public"."inquiries_id_seq";
DROP TABLE IF EXISTS "public"."inquiries";
DROP SCHEMA IF EXISTS "public";
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE "public"."inquiries" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "vehicle_id" integer,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'new'::"text"
);


ALTER TABLE "public"."inquiries" OWNER TO "neondb_owner";

--
-- Name: inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE "public"."inquiries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."inquiries_id_seq" OWNER TO "neondb_owner";

--
-- Name: inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE "public"."inquiries_id_seq" OWNED BY "public"."inquiries"."id";


--
-- Name: saved_vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE "public"."saved_vehicles" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "vehicle_id" integer NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_vehicles" OWNER TO "neondb_owner";

--
-- Name: saved_vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE "public"."saved_vehicles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."saved_vehicles_id_seq" OWNER TO "neondb_owner";

--
-- Name: saved_vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE "public"."saved_vehicles_id_seq" OWNED BY "public"."saved_vehicles"."id";


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE "public"."testimonials" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "vehicle" "text" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text" NOT NULL,
    "is_approved" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."testimonials" OWNER TO "neondb_owner";

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE "public"."testimonials_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."testimonials_id_seq" OWNER TO "neondb_owner";

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE "public"."testimonials_id_seq" OWNED BY "public"."testimonials"."id";


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE "public"."users" (
    "id" integer NOT NULL,
    "username" "text" NOT NULL,
    "password" "text" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'customer'::"text",
    "first_name" "text",
    "last_name" "text",
    "phone" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "neondb_owner";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "neondb_owner";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE "public"."vehicles" (
    "id" integer NOT NULL,
    "make" "text" NOT NULL,
    "model" "text" NOT NULL,
    "year" integer NOT NULL,
    "price" integer NOT NULL,
    "mileage" integer NOT NULL,
    "fuel_type" "text" NOT NULL,
    "transmission" "text" NOT NULL,
    "color" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "condition" "text" DEFAULT 'Used'::"text" NOT NULL,
    "is_featured" boolean DEFAULT false,
    "features" "json" DEFAULT '[]'::"json" NOT NULL,
    "images" "json" DEFAULT '[]'::"json" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "vin" "text" NOT NULL,
    "status" "text" DEFAULT 'available'::"text" NOT NULL
);


ALTER TABLE "public"."vehicles" OWNER TO "neondb_owner";

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE "public"."vehicles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vehicles_id_seq" OWNER TO "neondb_owner";

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE "public"."vehicles_id_seq" OWNED BY "public"."vehicles"."id";


--
-- Name: inquiries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."inquiries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."inquiries_id_seq"'::"regclass");


--
-- Name: saved_vehicles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."saved_vehicles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."saved_vehicles_id_seq"'::"regclass");


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."testimonials" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."testimonials_id_seq"'::"regclass");


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."vehicles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vehicles_id_seq"'::"regclass");


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (1, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-05 23:45:30.448484', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (2, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 00:02:52.244643', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (3, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 00:08:18.347926', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (4, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 00:18:19.595894', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (5, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 01:17:33.873809', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (6, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 02:56:01.42268', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (7, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 03:06:27.842386', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (8, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 03:23:13.344723', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (9, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 03:28:25.594932', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (10, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 03:50:13.007787', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (11, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:06:43.194593', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (12, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:17:52.897501', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (13, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:19:55.643008', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (14, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:21:57.045848', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (15, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:24:17.730761', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (16, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:28:43.142853', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (17, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:31:11.043557', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (18, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:39:44.865169', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (19, 'Test User', 'test@example.com', '123-456-7890', 'Test Email via SendGrid', 'This is a test message to verify SendGrid email delivery is working correctly.', NULL, '2025-05-06 04:44:12.745447', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (20, 'Test User', 'test@example.com', '123-456-7890', 'Test Email via SendGrid', 'This is a test message to verify SendGrid email delivery is working correctly.', NULL, '2025-05-06 04:44:52.157529', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (21, 'Test User', 'test@example.com', '123-456-7890', 'Test Email via SendGrid', 'This is a test message to verify SendGrid email delivery is working correctly.', NULL, '2025-05-06 04:45:24.9143', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (22, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'Second attempt asking for live training ', 'testing the contact form ', NULL, '2025-05-06 04:47:07.128831', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (23, 'Test User', 'test@example.com', '123-456-7890', 'Test Email with Updated Template', 'This is a test message to verify the new email template is working correctly with SendGrid.', NULL, '2025-05-06 04:47:42.942102', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (24, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 04:49:04.004994', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (25, 'Test User', 'test@example.com', '123-456-7890', 'Test Email with Non-DMARC Sender', 'This is a test message to verify the updated email configuration with a different sender domain.', NULL, '2025-05-06 04:51:41.581646', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (26, 'Test User 2', 'test2@example.com', '123-456-7899', 'Test Email with SendGrid Domain', 'This is a test message to verify the updated email configuration with SendGrid domain.', NULL, '2025-05-06 04:52:24.141679', 'new');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (28, 'Testing with noreply', 'test4@example.com', '123-456-7892', 'Test Email with Tracking Disabled', 'This is a test using noreply address and disabled tracking links.', NULL, '2025-05-06 04:58:31.644653', 'email-failed');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (29, 'Testing SendGrid Domain', 'test5@example.com', '123-456-7893', 'Testing with SendGrid Direct Domain', 'This is a test using SendGrid domain with disabled tracking links.', NULL, '2025-05-06 04:59:00.423666', 'email-failed');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (31, 'Final Test With Primary Email', 'test7@example.com', '123-456-7895', 'Testing With Primary Email', 'Testing with fateh@rpmautosales.ca as the verified sender.', NULL, '2025-05-06 05:24:01.842352', 'email-sent');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (27, 'Final Test User', 'test3@example.com', '123-456-7891', 'Final Test with Better Error Handling', 'This is a final test to verify the improved error handling and fallback mechanism.', NULL, '2025-05-06 04:53:18.775724', 'email-sent');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (30, 'Final Test After Rules', 'test6@example.com', '123-456-7894', 'Testing After Microsoft 365 Rules', 'This is a test after setting up Microsoft 365 rules for SendGrid.', NULL, '2025-05-06 05:22:48.719567', 'email-sent');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (32, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'test', 'testing the contact form ', NULL, '2025-05-06 05:32:24.06799', 'email-sent');
INSERT INTO "public"."inquiries" ("id", "name", "email", "phone", "subject", "message", "vehicle_id", "created_at", "status") VALUES (33, 'Hassan Sadiq', 'hassansadiq73@gmail.com', '4163170051', 'Vehicle Inquiry', 'I''m interested in learning more about this vehicle.', 6, '2025-05-07 15:59:41.48241', 'email-sent');


--
-- Data for Name: saved_vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--



--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO "public"."testimonials" ("id", "name", "vehicle", "rating", "comment", "is_approved", "created_at") VALUES (4, 'Michael T.', 'Ferrari 488 Owner', 5, 'The team at RPM Auto made buying my dream car an absolute pleasure. Their knowledge, professionalism, and attention to detail exceeded my expectations.', true, '2025-04-25 01:37:58.636016');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO "public"."users" ("id", "username", "password", "email", "role", "first_name", "last_name", "phone", "created_at", "updated_at") VALUES (1, 'admin', 'rpmauto2025', NULL, 'customer', NULL, NULL, NULL, '2025-05-07 22:51:28.536361', '2025-05-07 22:51:28.60853');


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

INSERT INTO "public"."vehicles" ("id", "make", "model", "year", "price", "mileage", "fuel_type", "transmission", "color", "description", "category", "condition", "is_featured", "features", "images", "created_at", "vin", "status") VALUES (5, 'McLaren', '600LT Coupe', 2019, 295000, 9075, 'Gasoline', 'Automatic', 'Azores Orange', 'Exceptional 2019 McLaren 600LT Coupe - the track-focused, limited production Longtail model from McLaren''s Sports Series. Powered by a 3.8L twin-turbocharged V8 engine producing 592 horsepower with a 0-60 time of just 2.9 seconds. Features McLaren''s lightweight carbon fiber MonoCell II chassis, distinctive top-exit exhaust system, and race-inspired aerodynamics. With only 9,075 kilometers, this rare performance machine represents the pinnacle of McLaren engineering.', 'Exotic Cars', 'Excellent', true, '["3.8L Twin-Turbocharged V8 Engine (592 hp)", "Carbon Fiber MonoCell II Chassis", "Carbon Fiber Racing Seats from McLaren P1", "Top-Exit Exhaust System", "Carbon Ceramic Brakes", "Alcantara Interior Trim", "McLaren Track Telemetry System", "Lightweight Forged Wheels", "7-Speed Seamless Shift Gearbox", "Fixed Rear Wing"]', '["vehicles/maclaren/maclaren_image1.jpg", "vehicles/maclaren/maclaren_image2.jpg", "vehicles/maclaren/maclaren_image3.jpg", "vehicles/maclaren/maclaren_image4.jpg", "vehicles/maclaren/maclaren_image5.jpg"]', '2025-04-22 21:37:20.105199', 'SBM13RAA1KW008137', 'sold');
INSERT INTO "public"."vehicles" ("id", "make", "model", "year", "price", "mileage", "fuel_type", "transmission", "color", "description", "category", "condition", "is_featured", "features", "images", "created_at", "vin", "status") VALUES (6, 'Porsche', 'Cayenne Diesel', 2016, 219950, 60000, 'Diesel', 'Automatic', 'GT Silver Metallic', '2016 Porsche Cayenne Diesel featuring a 3.0L turbocharged V6 diesel engine delivering 240 horsepower and 406 lb-ft of torque. This luxury SUV combines Porsche''s legendary handling with exceptional fuel efficiency, offering an impressive range of over 700 miles on a single tank. Equipped with Porsche Traction Management all-wheel drive and 8-speed Tiptronic S transmission. With 60,000 kilometers, this well-maintained Cayenne offers the perfect blend of performance, comfort, and practicality.', 'Exotic Cars', 'Excellent', true, '["3.0L Turbo Diesel V6 Engine (240 hp)", "8-speed Tiptronic S Automatic Transmission", "Porsche Traction Management All-Wheel Drive", "Bi-Xenon Headlights", "Porsche Communication Management System", "Partial Leather Upholstery", "Power Tailgate", "Front/Rear Parking Sensors", "Dual-Zone Climate Control", "10-Speaker Audio System"]', '["vehicles/porche/porche_image1.jpg", "vehicles/porche/porche_image2.jpg", "vehicles/porche/porche_image3.jpg", "vehicles/porche/porche_image4.jpg", "vehicles/porche/porche_image5.jpg"]', '2025-04-22 21:42:30.482249', 'WP1AF2A2XGKA43692', 'sold');
INSERT INTO "public"."vehicles" ("id", "make", "model", "year", "price", "mileage", "fuel_type", "transmission", "color", "description", "category", "condition", "is_featured", "features", "images", "created_at", "vin", "status") VALUES (7, 'Tesla', 'Model X Long Range', 2023, 119950, 4200, 'Electric', 'Automatic', 'Pearl White', '2023 Tesla Model X Long Range - Tesla''s innovative electric SUV featuring dual-motor all-wheel drive and a 100 kWh battery pack providing approximately 348 miles of range. This cutting-edge vehicle delivers exceptional performance with 0-60 mph acceleration in just 3.8 seconds while offering practical versatility with its distinctive Falcon Wing doors and spacious interior. Equipped with Tesla''s advanced driver assistance features and over-the-air update capability. With only 4,200 kilometers, this Model X is in pristine condition.', 'Electric Vehicles', 'Excellent', true, '["Dual Motor All-Wheel Drive", "100 kWh Battery with 348-Mile Range", "Falcon Wing Doors with Obstacle Detection", "17-inch Central Touchscreen", "HEPA Filtration with Bioweapon Defense Mode", "Premium Sound System with 22 Speakers", "Heated and Ventilated Front Seats", "Heated Second Row Seats", "Panoramic Windshield", "Traffic-Aware Cruise Control"]', '["vehicles/tesla/tesla_image1.jpg","vehicles/tesla/tesla_image2.jpg","vehicles/tesla/tesla_image3.jpg","vehicles/tesla/tesla_image4.jpg"]', '2025-04-22 21:42:30.643947', '7SAXCDE56PF375875', 'sold');
INSERT INTO "public"."vehicles" ("id", "make", "model", "year", "price", "mileage", "fuel_type", "transmission", "color", "description", "category", "condition", "is_featured", "features", "images", "created_at", "vin", "status") VALUES (4, 'BMW', 'M4 Cabriolet', 2018, 85950, 51390, 'Gasoline', 'Automatic', 'Black Sapphire Metallic', 'Immaculate 2018 BMW M4 Cabriolet featuring a twin-turbocharged 3.0L inline-six engine producing 425 horsepower and 406 lb-ft of torque. This high-performance convertible comes with the Competition Package boosting output to 444 horsepower with revised suspension tuning. The retractable hardtop opens in just 20 seconds at speeds up to 18 mph. This well-maintained example with 50,000 kilometers offers thrilling performance with the joy of open-air driving.', 'Sports Cars', 'Excellent', true, '["Adaptive M Suspension", "M Sport Seats with Heating", "Carbon Fiber Trim", "Harman Kardon Premium Sound System", "iDrive 6.0 with Navigation", "LED Adaptive Headlights", "M Sport Differential", "19-inch Forged Alloy Wheels", "M Performance Exhaust", "M Compound Brakes with blue calipers"]', '["vehicles/bmw/bmw_image1.jpg","vehicles/bmw/bmw_image2.jpg","vehicles/bmw/bmw_image3.jpg","vehicles/bmw/bmw_image4.jpg","vehicles/bmw/bmw_image5.jpg"]', '2025-04-22 21:26:50.934618', 'WBS4Z9C50JEA24138', 'sold');


--
-- Name: inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('"public"."inquiries_id_seq"', 33, true);


--
-- Name: saved_vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('"public"."saved_vehicles_id_seq"', 1, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('"public"."testimonials_id_seq"', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 1, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('"public"."vehicles_id_seq"', 7, true);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id");


--
-- Name: saved_vehicles saved_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."saved_vehicles"
    ADD CONSTRAINT "saved_vehicles_pkey" PRIMARY KEY ("id");


--
-- Name: saved_vehicles saved_vehicles_user_id_vehicle_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."saved_vehicles"
    ADD CONSTRAINT "saved_vehicles_user_id_vehicle_id_unique" UNIQUE ("user_id", "vehicle_id");


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_unique" UNIQUE ("username");


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");


--
-- Name: vehicles vehicles_vin_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_vin_unique" UNIQUE ("vin");


--
-- Name: inquiries inquiries_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE SET NULL;


--
-- Name: saved_vehicles saved_vehicles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."saved_vehicles"
    ADD CONSTRAINT "saved_vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: saved_vehicles saved_vehicles_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY "public"."saved_vehicles"
    ADD CONSTRAINT "saved_vehicles_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "cloud_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "neon_superuser" WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE "cloud_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "neon_superuser" WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

