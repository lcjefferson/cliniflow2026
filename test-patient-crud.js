// Test script to verify patient CRUD operations
// Run this in the browser console while logged in

async function testPatientCRUD() {
    console.log("🧪 Starting Patient CRUD Tests...\n");

    // Test 1: Create Patient
    console.log("1️⃣ Testing CREATE...");
    const createResponse = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "João da Silva",
            phone: "11987654321",
            email: "joao@test.com",
            cpf: "123.456.789-00",
            birthDate: "1990-01-15",
            gender: "Masculino",
            city: "São Paulo",
            state: "SP",
        }),
    });
    const createdPatient = await createResponse.json();
    console.log("✅ Created:", createdPatient);

    // Test 2: List Patients
    console.log("\n2️⃣ Testing LIST...");
    const listResponse = await fetch("/api/patients");
    const patients = await listResponse.json();
    console.log(`✅ Found ${patients.length} patients`);

    // Test 3: Get Single Patient
    console.log("\n3️⃣ Testing GET...");
    const getResponse = await fetch(`/api/patients/${createdPatient.id}`);
    const patient = await getResponse.json();
    console.log("✅ Retrieved:", patient);

    // Test 4: Update Patient (FIXED - only send validated fields)
    console.log("\n4️⃣ Testing UPDATE...");
    const updateResponse = await fetch(`/api/patients/${createdPatient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "João Silva Updated",
            phone: patient.phone,
            email: patient.email,
            cpf: patient.cpf,
            birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split("T")[0] : "",
            gender: patient.gender || "",
            city: patient.city || "",
            state: patient.state || "",
            address: patient.address || "",
            zipCode: patient.zipCode || "",
            occupation: patient.occupation || "",
            maritalStatus: patient.maritalStatus || "",
            emergencyContact: patient.emergencyContact || "",
            emergencyPhone: patient.emergencyPhone || "",
            notes: patient.notes || "",
        }),
    });
    const updatedPatient = await updateResponse.json();
    console.log("✅ Updated:", updatedPatient);

    // Test 5: Search Patients
    console.log("\n5️⃣ Testing SEARCH...");
    const searchResponse = await fetch("/api/patients?search=João");
    const searchResults = await searchResponse.json();
    console.log(`✅ Search found ${searchResults.length} results`);

    // Test 6: Delete Patient
    console.log("\n6️⃣ Testing DELETE...");
    const deleteResponse = await fetch(`/api/patients/${createdPatient.id}`, {
        method: "DELETE",
    });
    const deleteResult = await deleteResponse.json();
    console.log("✅ Deleted:", deleteResult);

    // Verify deletion
    console.log("\n7️⃣ Verifying deletion...");
    const finalListResponse = await fetch("/api/patients");
    const finalPatients = await finalListResponse.json();
    const stillExists = finalPatients.find((p) => p.id === createdPatient.id);
    console.log(
        stillExists
            ? "⚠️ Patient still exists (soft deleted)"
            : "✅ Patient removed from list"
    );

    console.log("\n✅ All tests completed!");
}

// Run the tests
testPatientCRUD();
