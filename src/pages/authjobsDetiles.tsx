// pages/JobApplicants.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Calendar, ArrowLeft, Download, User, FileText, Building2, MessageCircle, Mail } from "lucide-react";
import api from "@/lib/api";

const JobApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch job applicants only
  const fetchJobApplicants = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      console.log("🔄 Fetching applicants for job ID:", jobId);

      // 🔥 جيب بيانات المتقدمين فقط
      const applicantsRes = await api.get(`/jobs/${jobId}/applicants`);
      console.log("✅ Applicants API Response:", applicantsRes.data);
      
      // تعامل مع الهيكل الجديد للرد
      if (applicantsRes.data.result === "Success" && Array.isArray(applicantsRes.data.data)) {
        setApplicants(applicantsRes.data.data);
        console.log("✅ Applicants found:", applicantsRes.data.data.length);
      } else {
        console.log("❌ No applicants found in response");
        setApplicants([]);
      }

      // جيب بيانات الوظيفة بشكل منفصل
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        const jobData = jobRes.data.data || jobRes.data;
        setJob(jobData);
        console.log("✅ Job details found");
      } catch (jobError) {
        console.log("⚠️ Could not fetch job details");
      }

    } catch (error: any) {
      console.error("❌ Error fetching applicants:", error);
      console.error("❌ Error details:", error.response?.data);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobApplicants();
    }
  }, [jobId]);

  // Filter applicants based on search
  const filteredApplicants = applicants.filter(applicant =>
    applicant.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.cover_letter?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 

  const viewProfile = (applicant: any) => {
    if (applicant.user_id) {
      window.open(`/profile/${applicant.user_id}`, '_blank');
    } else if (applicant.id) {
      window.open(`/profile/${applicant.id}`, '_blank');
    }
  };

  const sendMessage = (applicant: any) => {
    if (applicant.user_id) {
      window.open(`/messages?user_id=${applicant.user_id}`, '_blank');
    } else if (applicant.id) {
      window.open(`/messages?user_id=${applicant.id}`, '_blank');
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
  const getUserName = (applicant: any) => {
    return applicant.user_name || "Unknown User";
  };

  // Get application status badge
  const getStatusBadge = (applicant: any) => {
    const status = applicant.status || "new";
    const statusConfig: any = {
      "new": { color: "bg-blue-100 text-blue-800", label: "New" },
      "reviewed": { color: "bg-yellow-100 text-yellow-800", label: "Reviewed" },
      "contacted": { color: "bg-purple-100 text-purple-800", label: "Contacted" },
      "rejected": { color: "bg-red-100 text-red-800", label: "Rejected" },
      "hired": { color: "bg-green-100 text-green-800", label: "Hired" }
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
                {job?.company?.name || job?.company_name || "Company"} • 
                {job?.location || "Location"} • 
                {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
              </p>
            </div>
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
                          alt={getUserName(applicant)}
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
                              {getUserName(applicant)}
                            </h3>
                            {getStatusBadge(applicant)}
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 text-sm flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Applied {formatDate(applicant.applied_at || applicant.created_at)}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <span className="font-semibold text-blue-700 block mb-1">Application Date</span>
                          <p className="text-blue-600">{formatDate(applicant.applied_at || applicant.created_at)}</p>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <span className="font-semibold text-green-700 block mb-1">Last Updated</span>
                          <p className="text-green-600">{formatDate(applicant.updated_at)}</p>
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
      </div>
    </MainLayout>
  );
};

export default JobApplicants;