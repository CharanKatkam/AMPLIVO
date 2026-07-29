-- Generated DDL for all domain tables

CREATE TABLE IF NOT EXISTS activity_logs (
	id UUID NOT NULL, 
	user_id UUID, 
	entity_type TEXT NOT NULL, 
	entity_id UUID, 
	action TEXT NOT NULL, 
	description TEXT, 
	metadata TEXT, 
	ip_address TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_activity_logs PRIMARY KEY (id), 
	CONSTRAINT fk_activity_logs_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ad_campaigns (
	id UUID NOT NULL, 
	client_id UUID, 
	platform TEXT NOT NULL, 
	name TEXT NOT NULL, 
	status TEXT NOT NULL, 
	daily_budget FLOAT, 
	total_budget FLOAT, 
	start_date DATE, 
	end_date DATE, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_ad_campaigns PRIMARY KEY (id), 
	CONSTRAINT fk_ad_campaigns_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_ad_campaigns_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ad_groups (
	id UUID NOT NULL, 
	campaign_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	status TEXT NOT NULL, 
	bid_amount FLOAT, 
	target_audience TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_ad_groups PRIMARY KEY (id), 
	CONSTRAINT fk_ad_groups_campaign_id_ad_campaigns FOREIGN KEY(campaign_id) REFERENCES ad_campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ad_metrics (
	id UUID NOT NULL, 
	campaign_id UUID NOT NULL, 
	date DATE NOT NULL, 
	impressions INTEGER NOT NULL, 
	clicks INTEGER NOT NULL, 
	conversions INTEGER NOT NULL, 
	spend FLOAT NOT NULL, 
	cpc FLOAT, 
	roas FLOAT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_ad_metrics PRIMARY KEY (id), 
	CONSTRAINT fk_ad_metrics_campaign_id_ad_campaigns FOREIGN KEY(campaign_id) REFERENCES ad_campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_decisions (
	id UUID NOT NULL, 
	request_id UUID NOT NULL, 
	approver_id UUID, 
	decision TEXT NOT NULL, 
	comment TEXT, 
	decided_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_approval_decisions PRIMARY KEY (id), 
	CONSTRAINT fk_approval_decisions_request_id_approval_requests FOREIGN KEY(request_id) REFERENCES approval_requests (id) ON DELETE CASCADE, 
	CONSTRAINT fk_approval_decisions_approver_id_users FOREIGN KEY(approver_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS approval_policies (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	module TEXT NOT NULL, 
	description TEXT, 
	required_approvers INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_approval_policies PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS approval_requests (
	id UUID NOT NULL, 
	policy_id UUID, 
	entity_type TEXT NOT NULL, 
	entity_id UUID NOT NULL, 
	title TEXT NOT NULL, 
	description TEXT, 
	requested_by UUID, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_approval_requests PRIMARY KEY (id), 
	CONSTRAINT fk_approval_requests_policy_id_approval_policies FOREIGN KEY(policy_id) REFERENCES approval_policies (id) ON DELETE SET NULL, 
	CONSTRAINT fk_approval_requests_requested_by_users FOREIGN KEY(requested_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
	id UUID NOT NULL, 
	table_name VARCHAR(100), 
	record_id UUID, 
	action VARCHAR(50), 
	old_data JSONB, 
	new_data JSONB, 
	performed_by UUID, 
	ip_address VARCHAR(45), 
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(), 
	CONSTRAINT pk_audit_logs PRIMARY KEY (id), 
	CONSTRAINT fk_audit_logs_performed_by_users FOREIGN KEY(performed_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS automation_actions (
	id UUID NOT NULL, 
	workflow_id UUID NOT NULL, 
	action_type TEXT NOT NULL, 
	action_config TEXT, 
	delay_seconds INTEGER NOT NULL, 
	sort_order INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_automation_actions PRIMARY KEY (id), 
	CONSTRAINT fk_automation_actions_workflow_id_automation_workflows FOREIGN KEY(workflow_id) REFERENCES automation_workflows (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS automation_logs (
	id UUID NOT NULL, 
	workflow_id UUID NOT NULL, 
	action_id UUID, 
	lead_id UUID, 
	status TEXT NOT NULL, 
	error_message TEXT, 
	executed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_automation_logs PRIMARY KEY (id), 
	CONSTRAINT fk_automation_logs_workflow_id_automation_workflows FOREIGN KEY(workflow_id) REFERENCES automation_workflows (id) ON DELETE CASCADE, 
	CONSTRAINT fk_automation_logs_action_id_automation_actions FOREIGN KEY(action_id) REFERENCES automation_actions (id) ON DELETE SET NULL, 
	CONSTRAINT fk_automation_logs_lead_id_leads FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS automation_workflows (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	description TEXT, 
	trigger_type TEXT NOT NULL, 
	trigger_config TEXT, 
	status TEXT NOT NULL, 
	client_id UUID, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_automation_workflows PRIMARY KEY (id), 
	CONSTRAINT fk_automation_workflows_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_automation_workflows_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS branches (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	code TEXT NOT NULL, 
	city TEXT NOT NULL, 
	state TEXT, 
	country TEXT NOT NULL, 
	address TEXT, 
	phone TEXT, 
	email TEXT, 
	is_headquarters BOOLEAN NOT NULL, 
	is_sales_office BOOLEAN NOT NULL, 
	timezone TEXT NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_branches PRIMARY KEY (id), 
	CONSTRAINT uq_branches_code UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS campaign_assets (
	id UUID NOT NULL, 
	campaign_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	asset_type TEXT NOT NULL, 
	file_url TEXT, 
	status TEXT NOT NULL, 
	uploaded_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_campaign_assets PRIMARY KEY (id), 
	CONSTRAINT fk_campaign_assets_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE, 
	CONSTRAINT fk_campaign_assets_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campaign_metrics (
	id UUID NOT NULL, 
	campaign_id UUID NOT NULL, 
	date DATE NOT NULL, 
	impressions INTEGER NOT NULL, 
	clicks INTEGER NOT NULL, 
	conversions INTEGER NOT NULL, 
	spend FLOAT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_campaign_metrics PRIMARY KEY (id), 
	CONSTRAINT fk_campaign_metrics_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaign_platforms (
	id UUID NOT NULL, 
	campaign_id UUID NOT NULL, 
	platform_name TEXT NOT NULL, 
	account_id TEXT, 
	status TEXT NOT NULL, 
	budget_allocation FLOAT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_campaign_platforms PRIMARY KEY (id), 
	CONSTRAINT fk_campaign_platforms_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	client_id UUID NOT NULL, 
	type TEXT NOT NULL, 
	status TEXT NOT NULL, 
	start_date DATE, 
	end_date DATE, 
	budget FLOAT, 
	spent_amount FLOAT NOT NULL, 
	target_audience TEXT, 
	description TEXT, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_campaigns PRIMARY KEY (id), 
	CONSTRAINT fk_campaigns_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_campaigns_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS case_studies (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	client_id UUID, 
	industry TEXT, 
	challenge TEXT, 
	solution TEXT, 
	results TEXT, 
	cover_image_url TEXT, 
	status TEXT NOT NULL, 
	published_at TIMESTAMP WITH TIME ZONE, 
	author_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_case_studies PRIMARY KEY (id), 
	CONSTRAINT uq_case_studies_slug UNIQUE (slug), 
	CONSTRAINT fk_case_studies_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_case_studies_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS case_study_metrics (
	id UUID NOT NULL, 
	case_study_id UUID NOT NULL, 
	label TEXT NOT NULL, 
	value TEXT NOT NULL, 
	sort_order INTEGER NOT NULL, 
	CONSTRAINT pk_case_study_metrics PRIMARY KEY (id), 
	CONSTRAINT fk_case_study_metrics_case_study_id_case_studies FOREIGN KEY(case_study_id) REFERENCES case_studies (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_addresses (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	address_type TEXT NOT NULL, 
	address_line_1 TEXT NOT NULL, 
	address_line_2 TEXT, 
	city TEXT NOT NULL, 
	state TEXT, 
	country TEXT NOT NULL, 
	postal_code TEXT, 
	is_primary BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_client_addresses PRIMARY KEY (id), 
	CONSTRAINT fk_client_addresses_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_contacts (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	email TEXT, 
	phone TEXT, 
	designation TEXT, 
	is_primary BOOLEAN NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	user_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_client_contacts PRIMARY KEY (id), 
	CONSTRAINT fk_client_contacts_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_client_contacts_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS client_documents (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	title TEXT NOT NULL, 
	document_type TEXT, 
	file_url TEXT, 
	file_size INTEGER, 
	uploaded_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_client_documents PRIMARY KEY (id), 
	CONSTRAINT fk_client_documents_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_client_documents_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS client_notes (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	content TEXT NOT NULL, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_client_notes PRIMARY KEY (id), 
	CONSTRAINT fk_client_notes_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_client_notes_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clients (
	id UUID NOT NULL, 
	company_name TEXT NOT NULL, 
	display_name TEXT, 
	industry TEXT, 
	website TEXT, 
	email TEXT, 
	phone TEXT, 
	gst_number TEXT, 
	pan_number TEXT, 
	client_type TEXT, 
	status TEXT NOT NULL, 
	assigned_to UUID, 
	branch_id UUID, 
	onboarding_date TIMESTAMP WITH TIME ZONE, 
	notes TEXT, 
	is_active BOOLEAN NOT NULL, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_clients PRIMARY KEY (id), 
	CONSTRAINT fk_clients_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_clients_branch_id_branches FOREIGN KEY(branch_id) REFERENCES branches (id) ON DELETE SET NULL, 
	CONSTRAINT fk_clients_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS companies (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	registration_number TEXT, 
	tax_id TEXT, 
	industry TEXT, 
	website TEXT, 
	email TEXT, 
	phone TEXT, 
	address TEXT, 
	logo_url TEXT, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_companies PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS consultation_requests (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	email TEXT NOT NULL, 
	phone TEXT, 
	company TEXT, 
	service_interest TEXT, 
	budget_range TEXT, 
	preferred_date DATE, 
	preferred_time TEXT, 
	message TEXT, 
	status TEXT NOT NULL, 
	assigned_to UUID, 
	notes TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_consultation_requests PRIMARY KEY (id), 
	CONSTRAINT fk_consultation_requests_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	email TEXT NOT NULL, 
	phone TEXT, 
	company TEXT, 
	subject TEXT, 
	message TEXT NOT NULL, 
	source TEXT, 
	status TEXT NOT NULL, 
	assigned_to UUID, 
	converted_lead_id UUID, 
	notes TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_contact_submissions PRIMARY KEY (id), 
	CONSTRAINT fk_contact_submissions_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_contact_submissions_converted_lead_id_leads FOREIGN KEY(converted_lead_id) REFERENCES leads (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS content_calendar_entries (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	content_type TEXT NOT NULL, 
	platform TEXT, 
	client_id UUID, 
	campaign_id UUID, 
	scheduled_date DATE, 
	publish_date DATE, 
	status TEXT NOT NULL, 
	content_brief TEXT, 
	media_urls TEXT, 
	assigned_to UUID, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_content_calendar_entries PRIMARY KEY (id), 
	CONSTRAINT fk_content_calendar_entries_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_content_calendar_entries_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL, 
	CONSTRAINT fk_content_calendar_entries_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_content_calendar_entries_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS content_categories (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_content_categories PRIMARY KEY (id), 
	CONSTRAINT uq_content_categories_name UNIQUE (name), 
	CONSTRAINT uq_content_categories_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS content_items (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	body TEXT NOT NULL, 
	excerpt TEXT, 
	status TEXT NOT NULL, 
	content_type TEXT NOT NULL, 
	category_id UUID, 
	author_id UUID, 
	published_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_content_items PRIMARY KEY (id), 
	CONSTRAINT uq_content_items_slug UNIQUE (slug), 
	CONSTRAINT fk_content_items_category_id_content_categories FOREIGN KEY(category_id) REFERENCES content_categories (id) ON DELETE SET NULL, 
	CONSTRAINT fk_content_items_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS creative_assets (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	name TEXT NOT NULL, 
	asset_type TEXT NOT NULL, 
	file_url TEXT, 
	version TEXT NOT NULL, 
	status TEXT NOT NULL, 
	designer_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_creative_assets PRIMARY KEY (id), 
	CONSTRAINT fk_creative_assets_project_id_creative_projects FOREIGN KEY(project_id) REFERENCES creative_projects (id) ON DELETE CASCADE, 
	CONSTRAINT fk_creative_assets_designer_id_users FOREIGN KEY(designer_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS creative_feedback (
	id UUID NOT NULL, 
	asset_id UUID NOT NULL, 
	content TEXT NOT NULL, 
	user_id UUID, 
	is_resolved BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_creative_feedback PRIMARY KEY (id), 
	CONSTRAINT fk_creative_feedback_asset_id_creative_assets FOREIGN KEY(asset_id) REFERENCES creative_assets (id) ON DELETE CASCADE, 
	CONSTRAINT fk_creative_feedback_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS creative_projects (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	client_id UUID, 
	campaign_id UUID, 
	description TEXT, 
	status TEXT NOT NULL, 
	due_date DATE, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_creative_projects PRIMARY KEY (id), 
	CONSTRAINT fk_creative_projects_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_creative_projects_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL, 
	CONSTRAINT fk_creative_projects_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS dashboards (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	description TEXT, 
	is_shared BOOLEAN NOT NULL, 
	layout_config TEXT, 
	owner_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_dashboards PRIMARY KEY (id), 
	CONSTRAINT fk_dashboards_owner_id_users FOREIGN KEY(owner_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS data_integrations (
	id UUID NOT NULL, 
	client_id UUID, 
	provider_name TEXT NOT NULL, 
	credentials_json TEXT, 
	status TEXT NOT NULL, 
	last_sync TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_data_integrations PRIMARY KEY (id), 
	CONSTRAINT fk_data_integrations_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS departments (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	head_user_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_departments PRIMARY KEY (id), 
	CONSTRAINT uq_departments_name UNIQUE (name), 
	CONSTRAINT uq_departments_slug UNIQUE (slug), 
	CONSTRAINT fk_departments_head_user_id_users FOREIGN KEY(head_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS designations (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	description TEXT, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_designations PRIMARY KEY (id), 
	CONSTRAINT uq_designations_title UNIQUE (title)
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	token_hash VARCHAR(255) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	is_used BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	verified_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_email_verification_tokens PRIMARY KEY (id), 
	CONSTRAINT fk_email_verification_tokens_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
	id UUID NOT NULL, 
	category TEXT NOT NULL, 
	amount FLOAT NOT NULL, 
	currency TEXT NOT NULL, 
	expense_date DATE NOT NULL, 
	description TEXT, 
	receipt_url TEXT, 
	logged_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_expenses PRIMARY KEY (id), 
	CONSTRAINT fk_expenses_logged_by_users FOREIGN KEY(logged_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faq_categories (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	sort_order INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_faq_categories PRIMARY KEY (id), 
	CONSTRAINT uq_faq_categories_name UNIQUE (name), 
	CONSTRAINT uq_faq_categories_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS faqs (
	id UUID NOT NULL, 
	category_id UUID, 
	question TEXT NOT NULL, 
	answer TEXT NOT NULL, 
	sort_order INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_faqs PRIMARY KEY (id), 
	CONSTRAINT fk_faqs_category_id_faq_categories FOREIGN KEY(category_id) REFERENCES faq_categories (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS file_folders (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	parent_id UUID, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_file_folders PRIMARY KEY (id), 
	CONSTRAINT fk_file_folders_parent_id_file_folders FOREIGN KEY(parent_id) REFERENCES file_folders (id) ON DELETE CASCADE, 
	CONSTRAINT fk_file_folders_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS files (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	original_name TEXT NOT NULL, 
	mime_type TEXT, 
	size INTEGER, 
	url TEXT NOT NULL, 
	folder_id UUID, 
	uploaded_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_files PRIMARY KEY (id), 
	CONSTRAINT fk_files_folder_id_file_folders FOREIGN KEY(folder_id) REFERENCES file_folders (id) ON DELETE SET NULL, 
	CONSTRAINT fk_files_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS influencer_campaigns (
	id UUID NOT NULL, 
	influencer_id UUID NOT NULL, 
	campaign_id UUID, 
	status TEXT NOT NULL, 
	deliverables TEXT, 
	budget FLOAT, 
	publish_date DATE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_influencer_campaigns PRIMARY KEY (id), 
	CONSTRAINT fk_influencer_campaigns_influencer_id_influencers FOREIGN KEY(influencer_id) REFERENCES influencers (id) ON DELETE CASCADE, 
	CONSTRAINT fk_influencer_campaigns_campaign_id_campaigns FOREIGN KEY(campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS influencer_contracts (
	id UUID NOT NULL, 
	influencer_id UUID NOT NULL, 
	campaign_id UUID, 
	document_url TEXT, 
	status TEXT NOT NULL, 
	signed_date DATE, 
	valid_until DATE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_influencer_contracts PRIMARY KEY (id), 
	CONSTRAINT fk_influencer_contracts_influencer_id_influencers FOREIGN KEY(influencer_id) REFERENCES influencers (id) ON DELETE CASCADE, 
	CONSTRAINT fk_influencer_contracts_campaign_id_influencer_campaigns FOREIGN KEY(campaign_id) REFERENCES influencer_campaigns (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS influencers (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	email TEXT, 
	phone TEXT, 
	niche TEXT, 
	platform TEXT NOT NULL, 
	profile_url TEXT, 
	followers_count INTEGER, 
	engagement_rate FLOAT, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_influencers PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
	id UUID NOT NULL, 
	invoice_id UUID NOT NULL, 
	description TEXT NOT NULL, 
	quantity FLOAT NOT NULL, 
	unit_price FLOAT NOT NULL, 
	tax_rate FLOAT NOT NULL, 
	total FLOAT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_invoice_items PRIMARY KEY (id), 
	CONSTRAINT fk_invoice_items_invoice_id_invoices FOREIGN KEY(invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	invoice_number TEXT NOT NULL, 
	status TEXT NOT NULL, 
	issue_date DATE NOT NULL, 
	due_date DATE NOT NULL, 
	subtotal FLOAT NOT NULL, 
	tax_total FLOAT NOT NULL, 
	total_amount FLOAT NOT NULL, 
	currency TEXT NOT NULL, 
	notes TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_invoices PRIMARY KEY (id), 
	CONSTRAINT fk_invoices_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number)
);

CREATE TABLE IF NOT EXISTS job_applications (
	id UUID NOT NULL, 
	job_opening_id UUID NOT NULL, 
	applicant_name TEXT NOT NULL, 
	applicant_email TEXT NOT NULL, 
	applicant_phone TEXT, 
	resume_url TEXT, 
	cover_letter TEXT, 
	status TEXT NOT NULL, 
	notes TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_job_applications PRIMARY KEY (id), 
	CONSTRAINT fk_job_applications_job_opening_id_job_openings FOREIGN KEY(job_opening_id) REFERENCES job_openings (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_openings (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	department_id UUID, 
	location TEXT, 
	employment_type TEXT NOT NULL, 
	description TEXT, 
	requirements TEXT, 
	salary_range TEXT, 
	status TEXT NOT NULL, 
	posted_at TIMESTAMP WITH TIME ZONE, 
	closed_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_job_openings PRIMARY KEY (id), 
	CONSTRAINT fk_job_openings_department_id_departments FOREIGN KEY(department_id) REFERENCES departments (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_activities (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	activity_type TEXT NOT NULL, 
	description TEXT, 
	performed_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_lead_activities PRIMARY KEY (id), 
	CONSTRAINT fk_lead_activities_lead_id_leads FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	CONSTRAINT fk_lead_activities_performed_by_users FOREIGN KEY(performed_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_followups (
	id UUID NOT NULL, 
	lead_id UUID NOT NULL, 
	followup_date TIMESTAMP WITH TIME ZONE NOT NULL, 
	followup_type TEXT NOT NULL, 
	notes TEXT, 
	status TEXT NOT NULL, 
	assigned_to UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_lead_followups PRIMARY KEY (id), 
	CONSTRAINT fk_lead_followups_lead_id_leads FOREIGN KEY(lead_id) REFERENCES leads (id) ON DELETE CASCADE, 
	CONSTRAINT fk_lead_followups_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_sources (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_lead_sources PRIMARY KEY (id), 
	CONSTRAINT uq_lead_sources_name UNIQUE (name), 
	CONSTRAINT uq_lead_sources_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS leads (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	company_name TEXT, 
	contact_name TEXT, 
	email TEXT, 
	phone TEXT, 
	source_id UUID, 
	status TEXT NOT NULL, 
	priority TEXT NOT NULL, 
	estimated_value FLOAT, 
	assigned_to UUID, 
	converted_client_id UUID, 
	converted_at TIMESTAMP WITH TIME ZONE, 
	notes TEXT, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_leads PRIMARY KEY (id), 
	CONSTRAINT fk_leads_source_id_lead_sources FOREIGN KEY(source_id) REFERENCES lead_sources (id) ON DELETE SET NULL, 
	CONSTRAINT fk_leads_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_leads_converted_client_id_clients FOREIGN KEY(converted_client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_leads_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS login_history (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	login_time TIMESTAMP WITH TIME ZONE NOT NULL, 
	logout_time TIMESTAMP WITH TIME ZONE, 
	ip_address VARCHAR(45), 
	browser VARCHAR(100), 
	operating_system VARCHAR(100), 
	device VARCHAR(50), 
	status VARCHAR(20) NOT NULL, 
	refresh_token_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_login_history PRIMARY KEY (id), 
	CONSTRAINT fk_login_history_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT fk_login_history_refresh_token_id_refresh_tokens FOREIGN KEY(refresh_token_id) REFERENCES refresh_tokens (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notification_templates (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	channel TEXT NOT NULL, 
	subject TEXT, 
	body TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_notification_templates PRIMARY KEY (id), 
	CONSTRAINT uq_notification_templates_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS notifications (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	template_id UUID, 
	channel TEXT NOT NULL, 
	title TEXT NOT NULL, 
	message TEXT NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	read_at TIMESTAMP WITH TIME ZONE, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_notifications PRIMARY KEY (id), 
	CONSTRAINT fk_notifications_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT fk_notifications_template_id_notification_templates FOREIGN KEY(template_id) REFERENCES notification_templates (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	token_hash VARCHAR(255) NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	is_used BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	used_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id), 
	CONSTRAINT fk_password_reset_tokens_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
	id UUID NOT NULL, 
	invoice_id UUID NOT NULL, 
	amount FLOAT NOT NULL, 
	payment_date DATE NOT NULL, 
	payment_method TEXT NOT NULL, 
	reference_number TEXT, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_payments PRIMARY KEY (id), 
	CONSTRAINT fk_payments_invoice_id_invoices FOREIGN KEY(invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions (
	id UUID NOT NULL, 
	module TEXT NOT NULL, 
	action TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_permissions PRIMARY KEY (id), 
	CONSTRAINT uq_permissions_module_action UNIQUE (module, action), 
	CONSTRAINT uq_permissions_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS portal_announcements (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	content TEXT NOT NULL, 
	client_id UUID, 
	is_active BOOLEAN NOT NULL, 
	author_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_portal_announcements PRIMARY KEY (id), 
	CONSTRAINT fk_portal_announcements_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_portal_announcements_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_resources (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	title TEXT NOT NULL, 
	description TEXT, 
	file_url TEXT NOT NULL, 
	resource_type TEXT NOT NULL, 
	uploaded_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_portal_resources PRIMARY KEY (id), 
	CONSTRAINT fk_portal_resources_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_portal_resources_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS portal_settings (
	id UUID NOT NULL, 
	client_id UUID NOT NULL, 
	custom_domain TEXT, 
	theme_color TEXT, 
	logo_url TEXT, 
	features_enabled TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_portal_settings PRIMARY KEY (id), 
	CONSTRAINT uq_portal_settings_client_id UNIQUE (client_id), 
	CONSTRAINT fk_portal_settings_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolio_items (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	client_id UUID, 
	description TEXT, 
	category TEXT, 
	cover_image_url TEXT, 
	live_url TEXT, 
	technologies TEXT, 
	status TEXT NOT NULL, 
	sort_order INTEGER NOT NULL, 
	author_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_portfolio_items PRIMARY KEY (id), 
	CONSTRAINT uq_portfolio_items_slug UNIQUE (slug), 
	CONSTRAINT fk_portfolio_items_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_portfolio_items_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS projects (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	client_id UUID, 
	description TEXT, 
	status TEXT NOT NULL, 
	start_date DATE, 
	end_date DATE, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_projects PRIMARY KEY (id), 
	CONSTRAINT fk_projects_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_projects_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	token_hash VARCHAR(255) NOT NULL, 
	is_revoked BOOLEAN NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	user_agent VARCHAR(255), 
	ip_address VARCHAR(45), 
	device_name VARCHAR(100), 
	browser VARCHAR(100), 
	operating_system VARCHAR(100), 
	last_used TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	revoked_at TIMESTAMP WITH TIME ZONE, 
	CONSTRAINT pk_refresh_tokens PRIMARY KEY (id), 
	CONSTRAINT fk_refresh_tokens_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	report_type TEXT NOT NULL, 
	client_id UUID, 
	parameters TEXT, 
	generated_file_url TEXT, 
	status TEXT NOT NULL, 
	generated_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_reports PRIMARY KEY (id), 
	CONSTRAINT fk_reports_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE CASCADE, 
	CONSTRAINT fk_reports_generated_by_users FOREIGN KEY(generated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
	role_id UUID NOT NULL, 
	permission_id UUID NOT NULL, 
	granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id), 
	CONSTRAINT fk_role_permissions_role_id_roles FOREIGN KEY(role_id) REFERENCES roles (id) ON DELETE CASCADE, 
	CONSTRAINT fk_role_permissions_permission_id_permissions FOREIGN KEY(permission_id) REFERENCES permissions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	is_system BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_roles PRIMARY KEY (id), 
	CONSTRAINT uq_roles_name UNIQUE (name), 
	CONSTRAINT uq_roles_slug UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS sales_pipeline (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	stage TEXT NOT NULL, 
	"order" INTEGER NOT NULL, 
	probability FLOAT, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_sales_pipeline PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS seo_audits (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	audit_date DATE NOT NULL, 
	health_score FLOAT, 
	errors_count INTEGER, 
	warnings_count INTEGER, 
	notices_count INTEGER, 
	report_url TEXT, 
	conducted_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_seo_audits PRIMARY KEY (id), 
	CONSTRAINT fk_seo_audits_project_id_seo_projects FOREIGN KEY(project_id) REFERENCES seo_projects (id) ON DELETE CASCADE, 
	CONSTRAINT fk_seo_audits_conducted_by_users FOREIGN KEY(conducted_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS seo_backlinks (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	source_url TEXT NOT NULL, 
	target_url TEXT NOT NULL, 
	domain_authority INTEGER, 
	is_dofollow BOOLEAN NOT NULL, 
	status TEXT NOT NULL, 
	discovered_at DATE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_seo_backlinks PRIMARY KEY (id), 
	CONSTRAINT fk_seo_backlinks_project_id_seo_projects FOREIGN KEY(project_id) REFERENCES seo_projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_keywords (
	id UUID NOT NULL, 
	project_id UUID NOT NULL, 
	keyword TEXT NOT NULL, 
	search_volume INTEGER, 
	difficulty FLOAT, 
	current_rank INTEGER, 
	target_rank INTEGER, 
	url TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_seo_keywords PRIMARY KEY (id), 
	CONSTRAINT fk_seo_keywords_project_id_seo_projects FOREIGN KEY(project_id) REFERENCES seo_projects (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_projects (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	client_id UUID, 
	target_url TEXT NOT NULL, 
	description TEXT, 
	status TEXT NOT NULL, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_seo_projects PRIMARY KEY (id), 
	CONSTRAINT fk_seo_projects_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT fk_seo_projects_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS social_metrics (
	id UUID NOT NULL, 
	post_id UUID NOT NULL, 
	date DATE NOT NULL, 
	likes INTEGER NOT NULL, 
	comments INTEGER NOT NULL, 
	shares INTEGER NOT NULL, 
	clicks INTEGER NOT NULL, 
	impressions INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_social_metrics PRIMARY KEY (id), 
	CONSTRAINT fk_social_metrics_post_id_social_posts FOREIGN KEY(post_id) REFERENCES social_posts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_posts (
	id UUID NOT NULL, 
	profile_id UUID NOT NULL, 
	content TEXT NOT NULL, 
	media_urls TEXT, 
	scheduled_at TIMESTAMP WITH TIME ZONE, 
	published_at TIMESTAMP WITH TIME ZONE, 
	status TEXT NOT NULL, 
	author_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_social_posts PRIMARY KEY (id), 
	CONSTRAINT fk_social_posts_profile_id_social_profiles FOREIGN KEY(profile_id) REFERENCES social_profiles (id) ON DELETE CASCADE, 
	CONSTRAINT fk_social_posts_author_id_users FOREIGN KEY(author_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS social_profiles (
	id UUID NOT NULL, 
	client_id UUID, 
	platform TEXT NOT NULL, 
	profile_name TEXT NOT NULL, 
	profile_url TEXT, 
	access_token TEXT, 
	status TEXT NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_social_profiles PRIMARY KEY (id), 
	CONSTRAINT fk_social_profiles_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
	id UUID NOT NULL, 
	key TEXT NOT NULL, 
	value TEXT NOT NULL, 
	description TEXT, 
	is_public BOOLEAN NOT NULL, 
	updated_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_system_settings PRIMARY KEY (id), 
	CONSTRAINT uq_system_settings_key UNIQUE (key), 
	CONSTRAINT fk_system_settings_updated_by_users FOREIGN KEY(updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_attachments (
	id UUID NOT NULL, 
	task_id UUID NOT NULL, 
	file_name TEXT NOT NULL, 
	file_url TEXT NOT NULL, 
	uploaded_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_task_attachments PRIMARY KEY (id), 
	CONSTRAINT fk_task_attachments_task_id_tasks FOREIGN KEY(task_id) REFERENCES tasks (id) ON DELETE CASCADE, 
	CONSTRAINT fk_task_attachments_uploaded_by_users FOREIGN KEY(uploaded_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_comments (
	id UUID NOT NULL, 
	task_id UUID NOT NULL, 
	content TEXT NOT NULL, 
	user_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_task_comments PRIMARY KEY (id), 
	CONSTRAINT fk_task_comments_task_id_tasks FOREIGN KEY(task_id) REFERENCES tasks (id) ON DELETE CASCADE, 
	CONSTRAINT fk_task_comments_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
	id UUID NOT NULL, 
	title TEXT NOT NULL, 
	description TEXT, 
	project_id UUID, 
	status TEXT NOT NULL, 
	priority TEXT NOT NULL, 
	due_date TIMESTAMP WITH TIME ZONE, 
	assigned_to UUID, 
	created_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_tasks PRIMARY KEY (id), 
	CONSTRAINT fk_tasks_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	CONSTRAINT fk_tasks_assigned_to_users FOREIGN KEY(assigned_to) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_tasks_created_by_users FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS teams (
	id UUID NOT NULL, 
	name TEXT NOT NULL, 
	slug TEXT NOT NULL, 
	description TEXT, 
	department_id UUID, 
	lead_user_id UUID, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_teams PRIMARY KEY (id), 
	CONSTRAINT uq_teams_slug UNIQUE (slug), 
	CONSTRAINT fk_teams_department_id_departments FOREIGN KEY(department_id) REFERENCES departments (id) ON DELETE SET NULL, 
	CONSTRAINT fk_teams_lead_user_id_users FOREIGN KEY(lead_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
	id UUID NOT NULL, 
	client_id UUID, 
	client_name TEXT NOT NULL, 
	client_title TEXT, 
	content TEXT NOT NULL, 
	rating INTEGER, 
	avatar_url TEXT, 
	is_featured BOOLEAN NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	sort_order INTEGER NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_testimonials PRIMARY KEY (id), 
	CONSTRAINT fk_testimonials_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS timesheets (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	task_id UUID, 
	project_id UUID, 
	date DATE NOT NULL, 
	hours FLOAT NOT NULL, 
	description TEXT, 
	status TEXT NOT NULL, 
	approved_by UUID, 
	approved_at TIMESTAMP WITH TIME ZONE, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_timesheets PRIMARY KEY (id), 
	CONSTRAINT fk_timesheets_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT fk_timesheets_task_id_tasks FOREIGN KEY(task_id) REFERENCES tasks (id) ON DELETE SET NULL, 
	CONSTRAINT fk_timesheets_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE SET NULL, 
	CONSTRAINT fk_timesheets_approved_by_users FOREIGN KEY(approved_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	theme TEXT NOT NULL, 
	language TEXT NOT NULL, 
	timezone TEXT NOT NULL, 
	email_notifications BOOLEAN NOT NULL, 
	in_app_notifications BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_user_preferences PRIMARY KEY (id), 
	CONSTRAINT uq_user_preferences_user_id UNIQUE (user_id), 
	CONSTRAINT fk_user_preferences_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
	user_id UUID NOT NULL, 
	full_name TEXT NOT NULL, 
	avatar_url TEXT, 
	designation TEXT, 
	bio TEXT, 
	gender TEXT, 
	date_of_birth DATE, 
	date_of_joining DATE, 
	timezone TEXT NOT NULL, 
	linkedin_url TEXT, 
	emergency_contact_name TEXT, 
	emergency_contact_phone TEXT, 
	address TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_user_profiles PRIMARY KEY (user_id), 
	CONSTRAINT fk_user_profiles_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
	id UUID NOT NULL, 
	user_id UUID NOT NULL, 
	refresh_token_id UUID, 
	device_name VARCHAR(100), 
	browser VARCHAR(100), 
	operating_system VARCHAR(100), 
	ip_address VARCHAR(45), 
	country VARCHAR(100), 
	city VARCHAR(100), 
	is_active BOOLEAN NOT NULL, 
	last_activity TIMESTAMP WITH TIME ZONE NOT NULL, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL, 
	CONSTRAINT pk_user_sessions PRIMARY KEY (id), 
	CONSTRAINT fk_user_sessions_user_id_users FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
	CONSTRAINT fk_user_sessions_refresh_token_id_refresh_tokens FOREIGN KEY(refresh_token_id) REFERENCES refresh_tokens (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
	id UUID NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	username VARCHAR(50) NOT NULL, 
	full_name VARCHAR(150) NOT NULL, 
	phone VARCHAR(20), 
	hashed_password VARCHAR(255) NOT NULL, 
	user_type TEXT NOT NULL, 
	status TEXT NOT NULL, 
	role_id UUID, 
	department_id UUID, 
	branch_id UUID, 
	reporting_manager_id UUID, 
	is_active BOOLEAN NOT NULL, 
	is_verified BOOLEAN NOT NULL, 
	verified_at TIMESTAMP WITH TIME ZONE, 
	last_login_at TIMESTAMP WITH TIME ZONE, 
	last_login_ip VARCHAR(45), 
	last_seen TIMESTAMP WITH TIME ZONE, 
	failed_login_attempts INTEGER NOT NULL, 
	last_failed_login TIMESTAMP WITH TIME ZONE, 
	locked_until TIMESTAMP WITH TIME ZONE, 
	is_deleted BOOLEAN NOT NULL, 
	deleted_at TIMESTAMP WITH TIME ZONE, 
	deleted_by UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_users PRIMARY KEY (id), 
	CONSTRAINT fk_users_role_id_roles FOREIGN KEY(role_id) REFERENCES roles (id) ON DELETE RESTRICT, 
	CONSTRAINT fk_users_department_id_departments FOREIGN KEY(department_id) REFERENCES departments (id) ON DELETE SET NULL, 
	CONSTRAINT fk_users_branch_id_branches FOREIGN KEY(branch_id) REFERENCES branches (id) ON DELETE SET NULL, 
	CONSTRAINT fk_users_reporting_manager_id_users FOREIGN KEY(reporting_manager_id) REFERENCES users (id) ON DELETE SET NULL, 
	CONSTRAINT fk_users_deleted_by_users FOREIGN KEY(deleted_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS website_metrics (
	id UUID NOT NULL, 
	website_id UUID NOT NULL, 
	date DATE NOT NULL, 
	visitors INTEGER NOT NULL, 
	page_views INTEGER NOT NULL, 
	bounce_rate INTEGER, 
	avg_session_duration INTEGER, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_website_metrics PRIMARY KEY (id), 
	CONSTRAINT fk_website_metrics_website_id_websites FOREIGN KEY(website_id) REFERENCES websites (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS website_pages (
	id UUID NOT NULL, 
	website_id UUID NOT NULL, 
	title TEXT NOT NULL, 
	url_path TEXT NOT NULL, 
	status TEXT NOT NULL, 
	seo_title TEXT, 
	seo_description TEXT, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_website_pages PRIMARY KEY (id), 
	CONSTRAINT fk_website_pages_website_id_websites FOREIGN KEY(website_id) REFERENCES websites (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS websites (
	id UUID NOT NULL, 
	client_id UUID, 
	domain TEXT NOT NULL, 
	name TEXT NOT NULL, 
	platform TEXT, 
	hosting_provider TEXT, 
	status TEXT NOT NULL, 
	manager_id UUID, 
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
	CONSTRAINT pk_websites PRIMARY KEY (id), 
	CONSTRAINT fk_websites_client_id_clients FOREIGN KEY(client_id) REFERENCES clients (id) ON DELETE SET NULL, 
	CONSTRAINT uq_websites_domain UNIQUE (domain), 
	CONSTRAINT fk_websites_manager_id_users FOREIGN KEY(manager_id) REFERENCES users (id) ON DELETE SET NULL
);
