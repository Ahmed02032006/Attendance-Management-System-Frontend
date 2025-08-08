import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { supabase } from '../../services/supabaseClient';
import { getClassesBySchoolId } from '../../store/Admin-Slicer/Admin-Class-Slicer';
import { createAdmission } from '../../store/Admin-Slicer/Admin-Admission-Slicer';
import { createParent } from '../../store/Admin-Slicer/Admin-Parent-Slicer';
import { createStudent } from '../../store/Admin-Slicer/Admin-Student-Slicer';

const initialState = {
    applicationId: '',
    studentName: '',
    studentEmail: '',
    grade: '',
    classId: '',
    dob: '',
    gender: '',
    age: '',
    section: '',
    rollNumber: '',
    nationality: '',
    religion: '',
    previousSchool: '',
    parentOrGuardianName: '',
    parentOrGuardianOccupation: '',
    parentOrGuardianRelation: '',
    parentOrGuardianEmail: '',
    relationship: '',
    contact: '',
    phone: '',
    address: '',
    appliedDate: '',
    status: 'Pending',
    documents: [{ name: 'Birth Certificate', file: null, status: 'Pending' }],
    profilePicture: null,
    profilePictureUrl: '',
    schoolId: sessionStorage.getItem("currentSchoolId"),
};

const StudentInfoSection = ({
    formData,
    setFormData,
    uniqueClassNames,
    availableSections,
    onGradeChange,
    loadingGrades,
    isUploading,
    uploadImage,
    calculateAge
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'dob') {
                updated.age = calculateAge(value);
            }
            return updated;
        });
    };

    const handleSectionChange = (e) => {
        setFormData(prev => ({ ...prev, section: e.target.value }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                Student Information
            </h3>

            <ProfilePictureUpload
                formData={formData}
                setFormData={setFormData}
                isUploading={isUploading}
                uploadImage={uploadImage}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application ID *</label>
                <input
                    type="text"
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="SA003"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Emma Johnson"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="emma.student@gmail.com"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <select
                        name="grade"
                        value={formData.grade}
                        onChange={(e) => onGradeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                        required
                        disabled={loadingGrades}
                    >
                        <option value="">Select Grade</option>
                        {uniqueClassNames.map((gradeName, index) => (
                            <option key={index} value={gradeName}>
                                {gradeName}
                            </option>
                        ))}
                    </select>
                    {loadingGrades && <p className="text-xs text-gray-500 mt-1">Loading grades...</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                    <select
                        name="section"
                        value={formData.section}
                        onChange={handleSectionChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                        required
                        disabled={!formData.grade}
                    >
                        <option value="">Select Section</option>
                        {availableSections.map((section, index) => (
                            <option key={index} value={section}>
                                {section}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="STU-004"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Canadian"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                    <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Buddhist"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Maple Leaf Elementary"
                />
            </div>
        </div>
    );
};

const ParentInfoSection = ({ formData, setFormData, uploadFile }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 pb-2 border-b border-gray-200">
                Parent/Guardian Information
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                    type="text"
                    name="parentOrGuardianName"
                    value={formData.parentOrGuardianName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="David Johnson"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                    type="text"
                    name="parentOrGuardianOccupation"
                    value={formData.parentOrGuardianOccupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Engineer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                <select
                    name="parentOrGuardianRelation"
                    value={formData.parentOrGuardianRelation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 appearance-none"
                    required
                >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                    type="email"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="david.j@example.com"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="+1 555-123-4567"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    rows="3"
                    placeholder="789 Oak St, Springfield"
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date *</label>
                <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    required
                />
            </div>

            <DocumentUploadSection
                formData={formData}
                setFormData={setFormData}
                uploadFile={uploadFile}
            />
        </div>
    );
};

const ProfilePictureUpload = ({ formData, setFormData, isUploading, uploadImage }) => {
    const [localUploading, setLocalUploading] = useState(false);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Immediately show the selected image
        const imageUrl = URL.createObjectURL(selectedFile);
        setFormData(prev => ({
            ...prev,
            profilePicture: selectedFile,
            profilePictureUrl: imageUrl
        }));

        // Start upload process
        setLocalUploading(true);
        try {
            const uploadedUrl = await uploadImage(selectedFile);
            setFormData(prev => ({
                ...prev,
                profilePictureUrl: uploadedUrl
            }));
        } catch (error) {
            console.error("Upload failed:", error);
            setFormData(prev => ({
                ...prev,
                profilePicture: null,
                profilePictureUrl: ''
            }));
        } finally {
            setLocalUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            profilePicture: null,
            profilePictureUrl: ''
        }));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo *</label>
            <div className="flex items-start space-x-4">
                <div className="relative group">
                    {(localUploading || isUploading) ? (
                        <div className="h-20 w-20 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : formData.profilePictureUrl ? (
                        <>
                            <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                <img
                                    src={formData.profilePictureUrl}
                                    alt="Student Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="h-20 w-20 rounded-md bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center hover:border-sky-400 transition-colors cursor-pointer">
                            <svg className="h-6 w-6 text-gray-400 group-hover:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                    )}
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={localUploading || isUploading}
                    />
                </div>
                <div className="text-xs text-gray-500">
                    <p className="font-medium text-gray-600 mb-1">Upload Requirements:</p>
                    <ul className="space-y-1">
                        <li>• JPG or PNG format</li>
                        <li>• Max size: 2MB</li>
                        <li>• 400×400px recommended</li>
                    </ul>
                    {(localUploading || isUploading) && <p className="text-sky-500 mt-1">Uploading image...</p>}
                </div>
            </div>
        </div>
    );
};

const DocumentUploadSection = ({ formData, setFormData, uploadFile }) => {
    const [documentUploading, setDocumentUploading] = useState(false);

    const handleDocumentFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDocumentUploading(true);
        try {
            const url = await uploadFile(file);
            setFormData(prev => ({
                ...prev,
                documents: [{
                    name: 'Birth Certificate',
                    file: url,
                    status: 'Pending'
                }]
            }));
        } catch (error) {
            console.error("Document upload failed:", error);
        } finally {
            setDocumentUploading(false);
        }
    };

    const handleRemoveDocument = () => {
        setFormData(prev => ({
            ...prev,
            documents: [{ name: 'Birth Certificate', file: null, status: 'Pending' }]
        }));
    };

    return (
        <div>
            <div className="w-full h-px bg-gray-200 my-4"></div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Required Documents</h4>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-700">Birth Certificate *</span>
                        </div>

                        {formData.documents[0]?.file ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600 px-2 py-1 bg-white rounded border border-gray-200 truncate max-w-[160px]">
                                    Uploaded
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRemoveDocument}
                                    className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                                    disabled={documentUploading}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer text-xs px-3 py-1.5 bg-sky-50 text-sky-600 border border-sky-200 rounded-md hover:bg-sky-100 transition-colors inline-flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                {documentUploading ? 'Uploading...' : 'Upload'}
                                <input
                                    type="file"
                                    onChange={handleDocumentFileChange}
                                    className="hidden"
                                    disabled={documentUploading}
                                />
                            </label>
                        )}
                    </div>

                    <div className="text-xs text-gray-500 pl-7">
                        {documentUploading ? (
                            <span className="text-sky-600">Uploading document...</span>
                        ) : formData.documents[0]?.file ? (
                            <span className="text-green-600">File uploaded successfully</span>
                        ) : (
                            <span>Please upload a scanned copy of birth certificate</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormActions = ({ isSubmitting, onReset }) => {
    return (
        <div className="flex justify-end space-x-3">
            <button
                type="button"
                onClick={onReset}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled={isSubmitting}
            >
                Reset Form
            </button>
            <button
                type="submit"
                className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Processing...' : 'Submit Admission'}
            </button>
        </div>
    );
};

const AdmissionForm = () => {
    const [formData, setFormData] = useState(initialState);
    const [isUploading, setIsUploading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [loadingGrades, setLoadingGrades] = useState(true);
    const [availableSections, setAvailableSections] = useState([]);

    const schoolId = sessionStorage.getItem("currentSchoolId") || null;
    const dispatch = useDispatch();
    const { classes } = useSelector((state) => state.adminClass);

    useEffect(() => {
        if (!schoolId) return;
        dispatch(getClassesBySchoolId(schoolId));
    }, [dispatch, schoolId]);

    useEffect(() => {
        if (classes && classes.length > 0) {
            setGrades(classes);
            setLoadingGrades(false);
        }
    }, [classes]);

    const calculateAge = (dobString) => {
        if (!dobString) return '';
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age.toString();
    };

    const getUniqueClassNames = () => {
        if (!grades || grades.length === 0) return [];
        return [...new Set(grades.map(grade => grade.name))];
    };

    const handleGradeChange = (selectedGrade) => {
        const selectedGradeObj = grades.find(grade => grade.name === selectedGrade);

        setFormData(prev => ({
            ...prev,
            grade: selectedGrade,
            classId: selectedGradeObj ? selectedGradeObj._id : '',
            section: ''
        }));

        if (selectedGrade) {
            const sectionsForGrade = grades
                .filter(grade => grade.name === selectedGrade)
                .map(grade => grade.section);
            setAvailableSections(sectionsForGrade);
        } else {
            setAvailableSections([]);
        }
    };

    const uploadImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(
                "http://localhost:5000/api/v1/media/upload-image",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                return response.data.result.url;
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            throw error;
        }
    };

    const uploadFile = async (file) => {
        try {
            if (!file) {
                toast.error("Please select a file to upload.");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { data, error } = await supabase.storage.from("birthcertificate").upload(filePath, file);

            if (error) {
                toast.error(error.message);
                throw error;
            }

            const { data: url } = await supabase.storage.from("birthcertificate").getPublicUrl(filePath);
            return url.publicUrl;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const handleAllFunctions = async (formData, studentForm, parentForm, createStudentForm, createParentForm) => {
        try {
            const result1 = await dispatch(createAdmission({ ...formData, parentOrGuardianEmail: formData.contact }));
            const result2 = await dispatch(createStudent(studentForm));
            const result3 = await dispatch(createParent({ ...parentForm, children: result2.payload.data._id }));

            const result4 = await axios.post(
                "http://localhost:5000/api/v1/auth/dynamicRegisterUser/",
                createStudentForm
            );

            const result5 = await axios.post(
                "http://localhost:5000/api/v1/auth/dynamicRegisterUser/",
                createParentForm
            );

            if (result1.payload.status === "Success" &&
                result2.payload.status === "Success" &&
                (result3.payload.status === "Success" || result3.payload.status === "Updated") &&
                result4.data.status === "Success" &&
                result5.data.status === "Success") {
                toast.success(result1.payload.message);
                setFormData(initialState);
            } else {
                throw new Error("One or more operations failed");
            }
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        if (!formData.profilePictureUrl) {
            toast.error('Please upload a profile picture');
            setIsUploading(false);
            return;
        }

        const studentForm = {
            studentId: "Stu001",
            admissionNumber: formData.applicationId,
            registrationDate: formData.appliedDate,
            profilePicture: formData.profilePictureUrl,
            studentName: formData.studentName,
            studentEmail: formData.studentEmail,
            studentPassword: formData.dob,
            gender: formData.gender,
            classId: formData.classId,
            dateOfBirth: formData.dob,
            age: formData.age,
            nationality: formData.nationality,
            religion: formData.religion,
            address: formData.address,
            section: formData.section,
            rollNumber: formData.rollNumber,
            admissionDate: new Date().toISOString().split('T')[0],
            previousSchool: formData.previousSchool,
            academicYear: new Date().getFullYear(),
            currentStatus: "Active",
            parentOrGuardianName: formData.parentOrGuardianName,
            parentOrGuardianRelation: formData.parentOrGuardianRelation,
            parentOrGuardianEmail: formData.contact,
            parentOrGuardianPhone: formData.phone,
            emergencyContactPhone: formData.contact,
            schoolId: formData.schoolId
        };

        const parentForm = {
            parentId: "Par001",
            parentName: formData.parentOrGuardianName,
            parentEmail: formData.contact,
            parentPassword: "Par001",
            parentProfilePicture: "https://www.shutterstock.com/image-vector/family-flat-icon-black-white-260nw-2198262051.jpg",
            phone: formData.phone,
            address: formData.address,
            status: "Active",
            schoolId: formData.schoolId
        };

        const createStudentForm = {
            userName: formData.studentName,
            userEmail: formData.studentEmail,
            userPassword: formData.dob,
            userRole: "Student",
            profilePicture: formData.profilePictureUrl,
            status: "Active",
        };

        const createParentForm = {
            userName: formData.parentOrGuardianName,
            userEmail: formData.contact,
            userPassword: formData.dob,
            userRole: "Parent",
            profilePicture: "https://www.shutterstock.com/image-vector/family-flat-icon-black-white-260nw-2198262051.jpg",
            status: "Active",
        };

        try {
            await handleAllFunctions(formData, studentForm, parentForm, createStudentForm, createParentForm);
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StudentInfoSection
                    formData={formData}
                    setFormData={setFormData}
                    uniqueClassNames={getUniqueClassNames()}
                    availableSections={availableSections}
                    onGradeChange={handleGradeChange}
                    loadingGrades={loadingGrades}
                    isUploading={isUploading}
                    uploadImage={uploadImage}
                    calculateAge={calculateAge}
                />

                <ParentInfoSection
                    formData={formData}
                    setFormData={setFormData}
                    uploadFile={uploadFile}
                />
            </div>

            <FormActions
                isSubmitting={isUploading}
                onReset={() => setFormData(initialState)}
            />
        </form>
    );
};

export default AdmissionForm;
