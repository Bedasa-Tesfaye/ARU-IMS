<?php

namespace App\Http\Controllers;

use App\Models\PartnershipApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PartnershipApplicationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'companyName' => 'required|string|max:255',
            'industry' => 'required|string|max:120',
            'companySize' => 'required|string|max:80',
            'website' => 'nullable|string|max:512',
            'description' => 'nullable|string|max:5000',

            'contactName' => 'required|string|max:255',
            'contactTitle' => 'required|string|max:255',
            'contactEmail' => 'required|email|max:255',
            'contactPhone' => 'required|string|max:40',
            'altContactName' => 'nullable|string|max:255',
            'altContactEmail' => 'nullable|email|max:255',
            'altContactPhone' => 'nullable|string|max:40',

            'country' => 'required|string|max:120',
            'region' => 'required|string|max:120',
            'city' => 'required|string|max:120',
            'subCity' => 'nullable|string|max:120',
            'streetAddress' => 'nullable|string|max:255',
            'buildingName' => 'nullable|string|max:255',
            'poBox' => 'nullable|string|max:80',

            'internCapacity' => 'required|string|max:80',
            'internshipAreas' => 'required|array|min:1',
            'internshipAreas.*' => 'string|max:120',
            'internshipAreasOther' => 'nullable|string|max:255',
            'preferredDuration' => 'nullable|string|max:80',
            'providesStipend' => ['required', Rule::in([true, false, 1, 0, '1', '0'])],
            'stipendRange' => 'nullable|string|max:120',
            'benefits' => 'nullable|array',
            'benefits.*' => 'string|max:120',
            'benefitsOther' => 'nullable|string|max:255',

            'motivation' => 'required|string|max:5000',
            'benefitToOrg' => 'nullable|string|max:5000',
            'hasPriorExperience' => ['required', Rule::in([true, false, 1, 0, '1', '0'])],
            'priorExperience' => 'nullable|string|max:5000',

            'agreementConfirmed' => 'accepted',
            'termsAccepted' => 'accepted',
            'reviewAcknowledged' => 'accepted',

            'documents.businessLicense' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.companyProfile' => 'nullable|file|mimes:pdf|max:5120',
            'documents.taxCertificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'documents.other' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ]);

        $providesStipend = filter_var($validated['providesStipend'], FILTER_VALIDATE_BOOLEAN);
        if ($providesStipend && empty($validated['stipendRange'])) {
            return response()->json([
                'success' => false,
                'message' => 'Please select a stipend range when stipend is provided.',
                'errors' => ['stipendRange' => ['Stipend range is required when stipend is yes.']],
            ], 422);
        }

        $hasPrior = filter_var($validated['hasPriorExperience'], FILTER_VALIDATE_BOOLEAN);
        if ($hasPrior && empty(trim((string) ($validated['priorExperience'] ?? '')))) {
            return response()->json([
                'success' => false,
                'message' => 'Please describe your prior internship experience.',
                'errors' => ['priorExperience' => ['This field is required when you have prior experience.']],
            ], 422);
        }

        $referenceId = 'ARU-PRT-' . date('Y') . '-' . strtoupper(Str::random(6));

        $documentPaths = [];
        $docKeys = ['businessLicense', 'companyProfile', 'taxCertificate', 'other'];
        foreach ($docKeys as $key) {
            $file = $request->file("documents.$key");
            if ($file) {
                $path = $file->store("partnership-applications/{$referenceId}", 'local');
                $documentPaths[$key] = $path;
            }
        }

        $payload = collect($validated)
            ->except(['documents'])
            ->merge([
                'providesStipend' => $providesStipend,
                'hasPriorExperience' => $hasPrior,
                'documents' => $documentPaths,
                'submittedAt' => now()->toIso8601String(),
            ])
            ->all();

        PartnershipApplication::create([
            'reference_id' => $referenceId,
            'contact_email' => $validated['contactEmail'],
            'payload' => $payload,
        ]);

        return response()->json([
            'success' => true,
            'referenceId' => $referenceId,
            'message' => 'Your partnership application has been received. We will review it within 3–5 business days.',
        ]);
    }
}
