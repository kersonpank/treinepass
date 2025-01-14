import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1705185600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Users table
        await queryRunner.query(`
            CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'GYM_OWNER', 'COMPANY_ADMIN', 'EMPLOYEE', 'INDIVIDUAL');

            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role user_role_enum DEFAULT 'INDIVIDUAL',
                phone VARCHAR(20),
                cpf VARCHAR(14),
                company_id UUID,
                employee_code VARCHAR(50),
                is_active BOOLEAN DEFAULT true,
                individual_plan_id UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Companies table
        await queryRunner.query(`
            CREATE TABLE companies (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                cnpj VARCHAR(18) UNIQUE NOT NULL,
                corporate_email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                is_active BOOLEAN DEFAULT true,
                subscription_plan_id UUID,
                max_employees INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE users 
            ADD CONSTRAINT fk_user_company 
            FOREIGN KEY (company_id) 
            REFERENCES companies(id);
        `);

        // Plans table
        await queryRunner.query(`
            CREATE TYPE plan_type_enum AS ENUM ('INDIVIDUAL', 'CORPORATE', 'GYM');

            CREATE TABLE plans (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                type plan_type_enum NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                max_employees INTEGER,
                max_gyms_access INTEGER,
                is_active BOOLEAN DEFAULT true,
                features TEXT[],
                stripe_product_id VARCHAR(255),
                stripe_price_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Subscriptions table
        await queryRunner.query(`
            CREATE TABLE subscriptions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                plan_id UUID NOT NULL REFERENCES plans(id),
                user_id UUID REFERENCES users(id),
                company_id UUID REFERENCES companies(id),
                start_date TIMESTAMP WITH TIME ZONE NOT NULL,
                end_date TIMESTAMP WITH TIME ZONE NOT NULL,
                is_active BOOLEAN DEFAULT true,
                stripe_subscription_id VARCHAR(255),
                stripe_customer_id VARCHAR(255),
                amount DECIMAL(10,2) NOT NULL,
                billing_cycle VARCHAR(20) DEFAULT 'monthly',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Invites table
        await queryRunner.query(`
            CREATE TABLE invites (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                used BOOLEAN DEFAULT false,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                company_id UUID NOT NULL REFERENCES companies(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS invites;`);
        await queryRunner.query(`DROP TABLE IF EXISTS subscriptions;`);
        await queryRunner.query(`DROP TABLE IF EXISTS plans;`);
        await queryRunner.query(`DROP TYPE IF EXISTS plan_type_enum;`);
        await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_user_company;`);
        await queryRunner.query(`DROP TABLE IF EXISTS companies;`);
        await queryRunner.query(`DROP TABLE IF EXISTS users;`);
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
    }
}
