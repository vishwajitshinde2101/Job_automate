/**
 * ======================== SEED PLANS ========================
 * Run this script to populate plans and plan_features tables
 * Usage: node server/db/seedPlans.js
 */

import sequelize from './config.js';
import Plan from '../models/Plan.js';
import PlanFeature from '../models/PlanFeature.js';

const plansData = [
    {
        name: 'Starter',
        description: 'Perfect for getting started with job automation',
        price: 299,
        durationDays: 7,
        sortOrder: 1,
        features: [
            { featureKey: 'applications_per_day', featureValue: '25', featureLabel: '25 applications per day' },
            { featureKey: 'job_portals', featureValue: '1', featureLabel: '1 job portal (Naukri)' },
            { featureKey: 'resume_profiles', featureValue: '1', featureLabel: '1 resume profile' },
            { featureKey: 'email_support', featureValue: 'true', featureLabel: 'Email support' },
            { featureKey: 'application_tracking', featureValue: 'basic', featureLabel: 'Basic application tracking' },
        ],
    },
    {
        name: 'Professional',
        description: 'Best value for serious job seekers',
        price: 799,
        durationDays: 30,
        sortOrder: 2,
        features: [
            { featureKey: 'applications_per_day', featureValue: '100', featureLabel: '100 applications per day' },
            { featureKey: 'job_portals', featureValue: '3', featureLabel: '3 job portals supported' },
            { featureKey: 'resume_profiles', featureValue: '3', featureLabel: '3 resume profiles' },
            { featureKey: 'priority_support', featureValue: 'true', featureLabel: 'Priority email support' },
            { featureKey: 'application_tracking', featureValue: 'advanced', featureLabel: 'Advanced application tracking' },
            { featureKey: 'smart_matching', featureValue: 'true', featureLabel: 'Smart job matching' },
            { featureKey: 'custom_filters', featureValue: 'true', featureLabel: 'Custom job filters' },
        ],
    },
    {
        name: 'Enterprise',
        description: 'Maximum automation for fastest results',
        price: 1999,
        durationDays: 90,
        sortOrder: 3,
        features: [
            { featureKey: 'applications_per_day', featureValue: 'unlimited', featureLabel: 'Unlimited applications' },
            { featureKey: 'job_portals', featureValue: 'all', featureLabel: 'All job portals supported' },
            { featureKey: 'resume_profiles', featureValue: 'unlimited', featureLabel: 'Unlimited resume profiles' },
            { featureKey: 'dedicated_support', featureValue: 'true', featureLabel: 'Dedicated account manager' },
            { featureKey: 'application_tracking', featureValue: 'premium', featureLabel: 'Premium analytics dashboard' },
            { featureKey: 'smart_matching', featureValue: 'true', featureLabel: 'AI-powered job matching' },
            { featureKey: 'custom_filters', featureValue: 'true', featureLabel: 'Advanced custom filters' },
            { featureKey: 'api_access', featureValue: 'true', featureLabel: 'API access' },
            { featureKey: 'priority_applications', featureValue: 'true', featureLabel: 'Priority application queue' },
        ],
    },
];

async function seedPlans() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected!\n');

        // Sync the models (create tables if not exists)
        await Plan.sync({ alter: true });
        await PlanFeature.sync({ alter: true });
        console.log('Plans and PlanFeatures tables ready.\n');

        // Clear existing data (optional - comment out if you want to preserve data)
        console.log('Clearing existing plans and features...');
        await PlanFeature.destroy({ where: {} });
        await Plan.destroy({ where: {} });
        console.log('Existing data cleared.\n');

        let totalPlans = 0;
        let totalFeatures = 0;

        for (const planData of plansData) {
            console.log(`Creating plan: ${planData.name}...`);

            // Create the plan
            const plan = await Plan.create({
                name: planData.name,
                description: planData.description,
                price: planData.price,
                durationDays: planData.durationDays,
                sortOrder: planData.sortOrder,
                isActive: true,
            });
            totalPlans++;

            // Create features for this plan
            for (const feature of planData.features) {
                await PlanFeature.create({
                    planId: plan.id,
                    featureKey: feature.featureKey,
                    featureValue: feature.featureValue,
                    featureLabel: feature.featureLabel,
                });
                totalFeatures++;
            }

            console.log(`  ✓ Plan created with ${planData.features.length} features`);
        }

        console.log(`\n✅ Successfully seeded ${totalPlans} plans with ${totalFeatures} features!`);

        // Display created plans
        console.log('\n📋 Created Plans:');
        const createdPlans = await Plan.findAll({
            include: [{ model: PlanFeature, as: 'features' }],
            order: [['sortOrder', 'ASC']],
        });

        for (const plan of createdPlans) {
            console.log(`\n  ${plan.name} (₹${plan.price}/${plan.durationDays} days)`);
            console.log(`  Features:`);
            for (const feature of plan.features) {
                console.log(`    - ${feature.featureLabel}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
}

seedPlans();
