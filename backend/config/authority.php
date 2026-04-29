<?php

return [
    /**
     * Role slugs used in `users.role`.
     */
    'roles' => [
        'super_admin',
        'student',
        'examiner',
        'coordinator',
        'company',
        'advisor',
    ],

    /**
     * Permission matrix.
     *
     * Values:
     * - true: allowed
     * - false: denied
     * - 'own': allowed but must be scoped to owning user (e.g. "own applications")
     * - 'assigned': allowed but must be scoped to assigned entities (e.g. examiner assigned students/reports)
     * - 'department': allowed but must be scoped to the user's department
     * - 'final': allowed only for final approval steps (enforced at controller level)
     */
    'permissions' => [
        // SYSTEM ACCESS
        'system.dashboard.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'system.theme.change' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'system.notifications.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // PROFILE MANAGEMENT
        'profile.own.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'profile.own.edit' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'profile.password.change' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'profile.picture.upload' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'profile.others.view' => [
            'super_admin' => true,
            'student' => false,
            'examiner' => 'assigned',
            'coordinator' => 'department',
            'company' => false,
            'advisor' => 'assigned',
        ],

        // USER MANAGEMENT
        'users.create' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'users.edit' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'users.delete' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'users.suspend' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'users.activate' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'users.roles.assign' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'users.viewAny' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'users.search' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'users.filter.role' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'users.password.reset' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],

        // INTERNSHIP MANAGEMENT
        'internships.viewAny' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => 'own', 'advisor' => true,
        ],
        'internships.create' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'internships.edit' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'internships.delete' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'internships.approvePost' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'internships.search' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'internships.filter' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // APPLICATION MANAGEMENT
        'applications.apply' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'applications.viewAny' => [
            'super_admin' => true, 'student' => 'own', 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'applications.review' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'applications.approve' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'applications.reject' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'applications.withdraw' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'applications.shortlist' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],

        // REPORT MANAGEMENT
        'reports.weekly.submit' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'reports.monthly.submit' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'reports.final.submit' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'reports.viewAny' => [
            'super_admin' => true, 'student' => 'own', 'examiner' => true, 'coordinator' => true, 'company' => 'assigned', 'advisor' => 'assigned',
        ],
        'reports.review' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'reports.feedback.provide' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'reports.revisions.request' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'reports.approve' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => 'final', 'company' => false, 'advisor' => false,
        ],
        'reports.download' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // EVALUATION & GRADING
        'evaluations.self.submit' => [
            'super_admin' => false, 'student' => true, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'evaluations.student.evaluate' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'evaluations.results.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => 'assigned',
        ],
        'evaluations.grade.final.submit' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'evaluations.grade.final.approve' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'evaluations.report.grade.generate' => [
            'super_admin' => true, 'student' => false, 'examiner' => true, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],

        // ASSIGNMENT MANAGEMENT
        'assignments.examiner.assign' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'assignments.advisor.assign' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'assignments.students.viewAssigned' => [
            'super_admin' => false, 'student' => false, 'examiner' => true, 'coordinator' => true, 'company' => false, 'advisor' => true,
        ],
        'assignments.examiner.reassign' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'assignments.workload.view' => [
            'super_admin' => true, 'student' => false, 'examiner' => 'own', 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],

        // DEPARTMENT MANAGEMENT
        'departments.create' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'departments.edit' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'departments.delete' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'departments.stats.view' => [
            'super_admin' => true, 'student' => false, 'examiner' => true, 'coordinator' => true, 'company' => false, 'advisor' => true,
        ],

        // COMPANY MANAGEMENT
        'companies.register' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'companies.approve' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'companies.viewAny' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'companies.profile.edit' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'companies.delete' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],

        // PARTNERSHIP MANAGEMENT
        'partnerships.request' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => true, 'advisor' => false,
        ],
        'partnerships.approve' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'partnerships.view' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'partnerships.terminate' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],

        // NOTIFICATION MANAGEMENT
        'notifications.send' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'notifications.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'notifications.read.mark' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'notifications.preferences.configure' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // ANALYTICS & REPORTING
        'analytics.system.view' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'analytics.personal.view' => [
            'super_admin' => false, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'reports.custom.generate' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'data.export' => [
            'super_admin' => true, 'student' => false, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => false,
        ],
        'charts.view' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // SETTINGS & CONFIGURATION
        'settings.system.manage' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'settings.department.manage' => [
            'super_admin' => false, 'student' => false, 'examiner' => false, 'coordinator' => true, 'company' => false, 'advisor' => false,
        ],
        'settings.notifications.manage' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'settings.privacy.manage' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],

        // ACTIVITY & AUDIT
        'audit.activityLogs.view' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'audit.ownActivity.view' => [
            'super_admin' => false, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'audit.trail.access' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],

        // SUPPORT & HELP
        'support.tickets.submit' => [
            'super_admin' => false, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
        'support.tickets.viewAny' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => false, 'company' => false, 'advisor' => false,
        ],
        'support.tickets.resolve' => [
            'super_admin' => true, 'student' => false, 'examiner' => false, 'coordinator' => 'department', 'company' => false, 'advisor' => false,
        ],
        'support.docs.access' => [
            'super_admin' => true, 'student' => true, 'examiner' => true, 'coordinator' => true, 'company' => true, 'advisor' => true,
        ],
    ],
];

