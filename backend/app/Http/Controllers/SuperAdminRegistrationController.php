<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class SuperAdminRegistrationController extends Controller
{
    public function departments(Request $request)
    {
        $this->ensureSuperAdmin($request);

        return response()->json(
            Department::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
        );
    }

    public function registerStudent(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'year' => 'required|integer|min:1|max:8',
            'cgpa' => 'required|numeric|min:0|max:4',
            'student_id' => 'required|string|max:50|unique:users,student_id',
        ])->validate();

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: 'student',
            fullName: $validated['full_name'],
            phone: $validated['phone'] ?? null,
            departmentId: (int) $validated['department_id'],
            profileData: [
                'student_id' => $validated['student_id'],
                'year' => (int) $validated['year'],
                'cgpa' => (float) $validated['cgpa'],
            ],
            emailSeed: $validated['student_id'],
            studentId: $validated['student_id']
        );

        return response()->json([
            'message' => 'Student registered successfully.',
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'student_id' => $validated['student_id'],
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    public function registerStudentsBulk(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'students' => 'required|array|min:1',
            'students.*.full_name' => 'required|string|max:255',
            'students.*.phone' => 'nullable|string|max:20',
            'students.*.department_id' => 'required|exists:departments,id',
            'students.*.year' => 'required|integer|min:1|max:8',
            'students.*.cgpa' => 'required|numeric|min:0|max:4',
            'students.*.student_id' => 'required|string|max:50|distinct|unique:users,student_id',
        ])->validate();

        $credentials = [];
        $createdUsers = [];

        DB::transaction(function () use ($validated, &$credentials, &$createdUsers) {
            foreach ($validated['students'] as $student) {
                [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
                    role: 'student',
                    fullName: $student['full_name'],
                    phone: $student['phone'] ?? null,
                    departmentId: (int) $student['department_id'],
                    profileData: [
                        'student_id' => $student['student_id'],
                        'year' => (int) $student['year'],
                        'cgpa' => (float) $student['cgpa'],
                    ],
                    emailSeed: $student['student_id'],
                    studentId: $student['student_id']
                );

                $createdUsers[] = $user;
                $credentials[] = [
                    'name' => $user->full_name,
                    'email' => $user->email,
                    'password' => $plainPassword,
                    'student_id' => $student['student_id'],
                ];
            }
        });

        return response()->json([
            'message' => 'Students registered successfully.',
            'count' => count($createdUsers),
            'credentials' => $credentials,
        ], 201);
    }

    public function registerCompany(Request $request)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'country_region' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'sub_city' => 'nullable|string|max:100',
            'street' => 'nullable|string|max:100',
            'building' => 'nullable|string|max:100',
            'po_box' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'company_email' => 'required|email|max:255',
            'field_of_interest' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'contact_person' => 'required|string|max:255',
        ])->validate();

        $company = Company::create([
            'name' => $validated['company_name'],
            'industry' => $validated['field_of_interest'],
            'description' => 'Created by Super Admin onboarding dashboard',
            'website' => $validated['website'] ?? null,
            'address' => trim(implode(', ', array_filter([
                $validated['street'] ?? null,
                $validated['building'] ?? null,
                $validated['sub_city'] ?? null,
            ]))),
            'city' => $validated['city'],
            'country' => $validated['country_region'],
            'contact_person' => $validated['contact_person'],
            'contact_email' => $validated['company_email'] ?? null,
            'contact_phone' => $validated['phone'],
            'meta' => [
                'state' => $validated['state'],
                'po_box' => $validated['po_box'] ?? null,
                'sub_city' => $validated['sub_city'] ?? null,
                'street' => $validated['street'] ?? null,
                'building' => $validated['building'] ?? null,
            ],
        ]);

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: 'company',
            fullName: $validated['contact_person'],
            phone: $validated['phone'],
            companyId: $company->id,
            profileData: [
                'company_name' => $validated['company_name'],
                'field_of_interest' => $validated['field_of_interest'],
                'company_email' => $validated['company_email'] ?? null,
            ],
            emailSeed: $validated['company_name']
        );

        return response()->json([
            'message' => 'Company registered successfully.',
            'company' => $company,
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    public function registerExaminer(Request $request)
    {
        return $this->registerAcademicStaff($request, 'examiner');
    }

    public function registerAdvisor(Request $request)
    {
        return $this->registerAcademicStaff($request, 'advisor');
    }

    private function registerAcademicStaff(Request $request, string $role)
    {
        $this->ensureSuperAdmin($request);

        $validated = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'employee_id' => 'required|string|max:100',
            'department_id' => 'required|exists:departments,id',
            'highest_qualification' => 'required|string|max:100',
            'field_of_specialization' => 'required|string|max:255',
            'years_of_experience' => 'required|integer|min:0|max:60',
        ])->validate();

        $employeeExists = User::where('employee_id', $validated['employee_id'])->exists();
        if ($employeeExists) {
            return response()->json([
                'message' => 'Employee ID already exists.',
            ], 422);
        }

        [$user, $plainPassword] = $this->createUserWithGeneratedCredentials(
            role: $role,
            fullName: $validated['full_name'],
            phone: $validated['phone'] ?? null,
            departmentId: (int) $validated['department_id'],
            profileData: [
                'employee_id' => $validated['employee_id'],
                'highest_qualification' => $validated['highest_qualification'],
                'field_of_specialization' => $validated['field_of_specialization'],
                'years_of_experience' => (int) $validated['years_of_experience'],
            ],
            emailSeed: $validated['employee_id'],
            employeeId: $validated['employee_id']
        );

        return response()->json([
            'message' => ucfirst($role) . ' registered successfully.',
            'user' => $user,
            'credentials' => [
                'name' => $user->full_name,
                'email' => $user->email,
                'password' => $plainPassword,
            ],
        ], 201);
    }

    private function createUserWithGeneratedCredentials(
        string $role,
        string $fullName,
        ?string $phone = null,
        ?int $departmentId = null,
        ?int $companyId = null,
        array $profileData = [],
        ?string $emailSeed = null,
        ?string $studentId = null,
        ?string $employeeId = null
    ): array {
        [$firstName, $lastName] = $this->splitFullName($fullName);
        $email = $this->generateUniqueEmail($emailSeed ?: $fullName, $role);
        $plainPassword = $this->generatePassword();

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => Hash::make($plainPassword),
            'phone' => $phone,
            'address' => null,
            'department_id' => $departmentId,
            'company_id' => $companyId,
            'student_id' => $studentId,
            'employee_id' => $employeeId,
            'role' => $role,
            'profile_data' => $profileData,
        ]);

        return [$user, $plainPassword];
    }

    private function splitFullName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        $firstName = $parts[0] ?? 'Unknown';
        $lastName = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : 'User';

        return [$firstName, $lastName];
    }

    private function generateUniqueEmail(string $seed, string $role): string
    {
        $baseLocalPart = Str::slug($seed ?: $role, '.');
        if ($baseLocalPart === '') {
            $baseLocalPart = $role;
        }

        $baseLocalPart = Str::limit($baseLocalPart, 32, '');
        $counter = 1;

        do {
            $suffix = $counter === 1 ? '' : ".{$counter}";
            $email = "{$baseLocalPart}{$suffix}@aruims.local";
            $counter++;
        } while (User::where('email', $email)->exists());

        return $email;
    }

    private function generatePassword(int $length = 12): string
    {
        return Str::password($length, true, true, true, false);
    }

    private function ensureSuperAdmin(Request $request): void
    {
        $user = auth()->user();

        abort_unless($user && $user->role === 'super_admin', 403, 'Only super admins can register actors.');
    }
}

