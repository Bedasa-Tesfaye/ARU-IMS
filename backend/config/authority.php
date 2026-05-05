<?php

/**
 * Role → permission matrix for Laravel Gates (see App\Support\Authority).
 *
 * `true` / `false`: allow / deny.
 * Strings like `own`, `department`: role may act; controller must enforce scope.
 */

return [
    'permissions' => [
        // Applications (web JSON API)
        'applications.viewAny' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => true,
            'company' => true,
            'examiner' => false,
            'advisor' => true,
        ],
        'applications.review' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'applications.approve' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'applications.reject' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'applications.withdraw' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => true,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],
        'applications.apply' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => true,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],

        // Internships
        'internships.viewAny' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => true,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'internships.create' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'internships.approvePost' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],
        'internships.edit' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],
        'internships.delete' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => false,
            'company' => true,
            'examiner' => false,
            'advisor' => false,
        ],

        // Evaluations
        'evaluations.results.view' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => true,
            'company' => true,
            'examiner' => true,
            'advisor' => true,
        ],
        'evaluations.student.evaluate' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => true,
            'examiner' => true,
            'advisor' => false,
        ],

        // Reports
        'reports.viewAny' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => true,
            'company' => true,
            'examiner' => true,
            'advisor' => true,
        ],
        'reports.weekly.submit' => [
            'super_admin' => false,
            'admin' => false,
            'coordinator' => false,
            'student' => true,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],
        'reports.review' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => false,
            'examiner' => true,
            'advisor' => false,
        ],

        // Assignments / admin utilities
        'assignments.examiner.assign' => [
            'super_admin' => true,
            'admin' => true,
            'coordinator' => true,
            'student' => false,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],

        // Super-admin dashboard metadata
        'system.dashboard.view' => [
            'super_admin' => true,
            'admin' => false,
            'coordinator' => false,
            'student' => false,
            'company' => false,
            'examiner' => false,
            'advisor' => false,
        ],
    ],
];
