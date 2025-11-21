// pages/JobApplicants.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Mail, Phone, Calendar, ArrowLeft, Download, User, FileText, Building2, MessageCircle } from "lucide-react";
import api from "@/lib/api";

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch job details and applicants
  const fetchJobAndApplicants = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      console.log("🔄 Fetching data for job ID:", jobId);

      // 🔥 Fetch job details from job-owner API
      const jobRes = await api.post("/job-owner/index");
      console.log("✅ Job Owner Response:", jobRes.data);
      
      const jobs = jobRes.data.data || [];
      const currentJob = jobs.find((j: any) => j.id === parseInt(jobId));
      
      if (currentJob) {
        setJob(currentJob);
        console.log("✅ Found job:", currentJob);
        
        // 🔥 إذا فيه applications في بيانات الوظيفة
        if (currentJob.applications && currentJob.applications.length > 0) {
          console.log("✅ Applications found in job data:", currentJob.applications);
          setApplicants(currentJob.applications);
        } else {
          // 🔥 نحاول نجيب الـ applicants من endpoint منفصل
          try {
            const applicantsRes = await api.get(`/jobs/${jobId}/applicants`);
            console.log("✅ Applicants API Response:", applicantsRes.data);
            setApplicants(applicantsRes.data.data || applicantsRes.data || []);
          } catch (applicantsError) {
            console.log("❌ Applicants API failed, using empty array");
            setApplicants([]);
          }
        }
      } else {
        console.log("❌ Job not found in job-owner data");
      }

    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      console.error("❌ Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 دالة بديلة علشان نستخدم بيانات وهمية للتجربة
  const useMockData = () => {
    console.log("🔄 Using mock data for testing");
    
    const mockJob = {
      id: parseInt(jobId || "0"),
      title: "Senior Frontend Developer",
      company: {
        name: "TechCorp Inc.",
        size: "200-500 employees",
        industry: "Technology",
        founded: "2015",
        website: "www.techcorp.com",
        location: "Cairo"
      },
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "120,000",
      available: true,
      description: "We are looking for a Senior Frontend Developer to join our growing team.",
      created_at: "2025-10-18T16:45:00.000Z"
    };
    
    const mockApplicants = [
      {
        id: 1,
        user_name: "John Doe",
        first_name: "John",
        last_name: "Doe",
        profile_image: "",
        cover_letter: "I am very interested in this position and have 5 years of experience in React and TypeScript. I believe my skills align perfectly with your requirements.",
        created_at: "2025-10-19T10:30:00.000Z",
        updated_at: "2025-10-19T10:30:00.000Z",
        user_id: 101
      },
      {
        id: 2,
        user_name: "Jane Smith",
        first_name: "Jane",
        last_name: "Smith",
        profile_image: "",
        cover_letter: "As a senior developer with 8 years of experience, I'm excited about the opportunity to contribute to your team and work on challenging projects.",
        created_at: "2025-10-19T14:20:00.000Z",
        updated_at: "2025-10-19T14:20:00.000Z",
        user_id: 102
      },
      {
        id: 3,
        user_name: "Mike Johnson",
        first_name: "Mike",
        last_name: "Johnson",
        profile_image: "",
        cover_letter: "I've been following your company's work and I'm impressed with your projects. I would love to bring my expertise in frontend development to your team.",
        created_at: "2025-10-20T09:15:00.000Z",
        updated_at: "2025-10-20T09:15:00.000Z",
        user_id: 103
      }
    ];
    
    setJob(mockJob);
    setApplicants(mockApplicants);
    setLoading(false);
  };

  useEffect(() => {
    if (jobId) {
      // جرب الـ API الحقيقي أولاً
      fetchJobAndApplicants();
      
      // إذا مش عاوز تنتظر، افتح التعليق على السطر ده علشان تستخدم البيانات الوهمية
      // setTimeout(useMockData, 1000);
    }
  }, [jobId]);

  // Filter applicants based on search
  const filteredApplicants = applicants.filter(applicant =>
    applicant.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.cover_letter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCV = (applicant: any) => {
    console.log("Download CV for:", getApplicantName(applicant));
    alert(`Download CV for ${getApplicantName(applicant)} - This would open the CV file`);
  };

  const viewProfile = (applicant: any) => {
    if (applicant.user_id) {
      window.open(`/profile/${applicant.user_id}`, '_blank');
    } else {
      alert(`Profile page for ${getApplicantName(applicant)}`);
    }
  };

  const sendMessage = (applicant: any) => {
    if (applicant.user_id) {
      window.open(`/messages?user_id=${applicant.user_id}`, '_blank');
    } else {
      alert(`Open chat with ${getApplicantName(applicant)}`);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get applicant display name
  const getApplicantName = (applicant: any) => {
    if (applicant.first_name && applicant.last_name) {
      return `${applicant.first_name} ${applicant.last_name}`;
    }
    return applicant.user_name || "Unknown User";
  };

  // Get application status badge
  const getStatusBadge = (applicant: any) => {
    const status = applicant.status || "new";
    const statusConfig: any = {
      "new": { color: "bg-blue-100 text-blue-800 border-blue-200", label: "New" },
      "reviewed": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Reviewed" },
      "contacted": { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Contacted" },
      "rejected": { color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
      "hired": { color: "bg-green-100 text-green-800 border-green-200", label: "Hired" }
    };
    
    const config = statusConfig[status] || statusConfig["new"];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-[#039fb3] hover:text-[#0288a1] mb-4">
            <ArrowLeft size={16} />
            Back to Jobs
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Applicants for {job?.title || "Job"}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {job?.company?.name || job?.company_name || "Company"} • {job?.location || "Location"} • {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Badge className={`text-sm px-3 py-1 ${
              job?.available 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              {job?.available ? 'Active' : 'Closed'}
            </Badge>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search applicants by name or cover letter..."
              className="pl-10 bg-white border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="text-center bg-white rounded-lg p-3 border border-gray-200 min-w-20">
              <div className="font-semibold text-lg text-[#039fb3]">
                {applicants.length}
              </div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center bg-white rounded-lg p-3 border border-gray-200 min-w-20">
              <div className="font-semibold text-lg text-green-600">
                {filteredApplicants.length}
              </div>
              <div className="text-gray-500">Filtered</div>
            </div>
          </div>
        </div>

        {/* Debug Info - يمكن إزالته في الإنتاج */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Job ID:</strong> {jobId} | <strong>Applicants:</strong> {applicants.length} | 
            <strong> Status:</strong> {loading ? "Loading..." : "Ready"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={useMockData}
          >
            Use Test Data
          </Button>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039fb3]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="hover:shadow-lg transition-shadow border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Applicant Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-[#039fb3]">
                      {applicant.profile_image ? (
                        <img
                          src={applicant.profile_image}
                          alt={getApplicantName(applicant)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#039fb3] flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {getApplicantName(applicant)}
                            </h3>
                            {getStatusBadge(applicant)}
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 text-sm flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Applied {formatDate(applicant.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Application #{applicant.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2 border-gray-300 hover:border-[#039fb3] hover:text-[#039fb3]"
                            onClick={() => downloadCV(applicant)}
                          >
                            <Download size={14} />
                            CV
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-gray-300 hover:border-purple-500 hover:text-purple-500"
                            onClick={() => sendMessage(applicant)}
                          >
                            <MessageCircle size={14} />
                            Message
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-[#039fb3] hover:bg-[#0288a1] flex items-center gap-2"
                            onClick={() => viewProfile(applicant)}
                          >
                            <User size={14} />
                            Profile
                          </Button>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {applicant.cover_letter && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Cover Letter
                          </h4>
                          <p className="text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed">
                            {applicant.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Application Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <span className="font-semibold text-blue-700 block mb-1">Application Date</span>
                          <p className="text-blue-600">{formatDate(applicant.created_at)}</p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <span className="font-semibold text-green-700 block mb-1">Last Updated</span>
                          <p className="text-green-600">{formatDate(applicant.updated_at)}</p>
                        </div>
                        
                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <span className="font-semibold text-purple-700 block mb-1">Contact</span>
                          <p className="text-purple-600 flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Platform Message
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredApplicants.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchTerm ? "No matching applicants" : "No applicants yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "No one has applied for this job position yet."
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm('')}
                      className="border-[#039fb3] text-[#039fb3] hover:bg-[#039fb3] hover:text-white"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Summary */}
        {job && (
          <Card className="mt-8 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Job Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Position</span>
                  <p className="text-gray-600">{job.title}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Company</span>
                  <p className="text-gray-600">{job.company?.name || job.company_name}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Location</span>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Job Type</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {job.type}
                  </Badge>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Salary</span>
                  <p className="text-green-600 font-semibold">${job.salary}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-1">Posted Date</span>
                  <p className="text-gray-600">{formatDate(job.created_at)}</p>
                </div>
              </div>
              
              {job.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="font-semibold text-gray-700 block mb-2">Job Description</span>
                  <p className="text-gray-600 leading-relaxed">{job.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default JobApplicants;