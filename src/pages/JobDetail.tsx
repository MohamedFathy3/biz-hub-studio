import { useState, useEffect, useContext } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2, 
  DollarSign, 
  Users, 
  Calendar,
  Share2,
  Heart,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AuthContext } from "@/Context/AuthContext";

// Firebase imports
import { db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch job details from API
  const fetchJobDetail = async () => {
    try {
      const res = await api.get(`/job/${id}`);
      setJob(res.data.data || res.data.message?.job);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  // 🔥 دالة إرسال الإشعارات
  const sendNotification = async (receiverId: number, notificationData: {
    type: string;
    title: string;
    message: string;
    sender_id: number;
    sender_name: string;
    sender_image: string;
    data?: any;
  }) => {
    try {
      if (!user) return;

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const notificationRef = ref(db, `notifications/${receiverId}/${notificationId}`);
      
      const fullNotificationData = {
        ...notificationData,
        id: notificationId,
        timestamp: Date.now(),
        read: false,
        sender_type: 'user'
      };

      await set(notificationRef, fullNotificationData);
      console.log("✅ Notification sent successfully to user:", receiverId);
      
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };

  // Handle job application
  const handleApply = async () => {
    if (!coverLetter.trim()) {
      alert("Please write a cover letter");
      return;
    }

    if (!user) {
      alert("Please login to apply for this job");
      return;
    }

    setApplying(true);
    try {
      // 1. إرسال الطلب للـ API
      await api.post(`/jobs/${id}/apply`, {
        cover_letter: coverLetter
      });

      // 🔥 2. إرسال إشعار لصاحب العمل
      if (job.user_id || job.company?.user_id) {
        const employerId = job.user_id || job.company?.user_id;
        
        await sendNotification(employerId, {
          type: 'new_job_application',
          title: 'New Job Application 📝',
          message: `${user.user_name} applied for your job: ${job.title}`,
          sender_id: user.id,
          sender_name: user.user_name,
          sender_image: user.profile_image,
          data: {
            job_id: job.id,
            job_title: job.title,
            applicant_id: user.id,
            applicant_name: user.user_name,
            cover_letter: coverLetter.substring(0, 200) + '...',
            applied_at: new Date().toISOString()
          }
        });

        // 🔥 3. إرسال إشعار push notification إضافي
        try {
          await api.post("/send-notification", {
            user_id: employerId,
            title: "New Job Application 📝",
            message: `${user.user_name} applied for your job: ${job.title}`,
            data: {
              type: 'new_job_application',
              job_id: job.id,
              applicant_id: user.id
            }
          });
          console.log("✅ Push notification sent to employer");
        } catch (notifError) {
          console.log("ℹ️ Push notification service not available");
        }
      }

      // 🔥 4. إرسال إشعار تأكيد للمتقدم
      await sendNotification(user.id, {
        type: 'job_application_sent',
        title: 'Application Sent! ✅',
        message: `Your application for ${job.title} has been submitted successfully`,
        sender_id: user.id,
        sender_name: 'System',
        sender_image: '',
        data: {
          job_id: job.id,
          job_title: job.title,
          company_name: job.company?.name || job.clinck,
          applied_at: new Date().toISOString(),
          status: 'pending'
        }
      });

      setApplySuccess(true);
      setApplyModalOpen(false);
      setCoverLetter("");

      // تحديث عدد المتقدمين
      fetchJobDetail();

    } catch (error: any) {
      console.error("Error applying for job:", error);
      
      // 🔥 إرسال إشعار خطأ
      if (user) {
        await sendNotification(user.id, {
          type: 'application_error',
          title: 'Application Failed ❌',
          message: `Failed to apply for ${job.title}. Please try again.`,
          sender_id: user.id,
          sender_name: 'System',
          sender_image: '',
          data: {
            job_id: job.id,
            job_title: job.title,
            error: error.response?.data?.message || 'Unknown error'
          }
        });
      }
      
      alert("Failed to apply for job");
    } finally {
      setApplying(false);
    }
  };

  // Format responsibilities, requirements, and benefits from string to array
  const formatListItems = (text: string) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim() !== '');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#039fb3]"></div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Job Not Found</h1>
          <Link to="/jobs">
            <Button className="bg-[#039fb3] hover:bg-[#0288a1]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const responsibilities = formatListItems(job.responsibilities);
  const requirements = formatListItems(job.requirements);
  const benefits = formatListItems(job.benefits);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link to="/jobs">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>

        {applySuccess && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 text-sm sm:text-base">Application Submitted!</p>
              <p className="text-xs sm:text-sm text-green-600">
                Your application has been sent successfully. The employer has been notified.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <Card className="border-gray-200">
              <CardContent className="p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mx-auto sm:mx-0">
                      {job.company?.logo || job.image_full_url ? (
                        <img
                          src={job.company?.logo || job.image_full_url}
                          alt={job.company?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{job.title}</h1>
                        {job.available && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm whitespace-nowrap mx-auto sm:mx-0">
                            Available
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 text-sm">
                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.company?.name || job.clinck || "Unknown Company"}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                 
                </div>
                
                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                    <div className="font-semibold text-sm sm:text-base">${job.salary}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Salary</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                    <div className="font-semibold text-sm sm:text-base">{job.type}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Job Type</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-yellow-600" />
                    <div className="font-semibold text-sm sm:text-base">{job.applications_count || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Applicants</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600" />
                    <div className="font-semibold text-sm sm:text-base">
                      {job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">Posted</div>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Job Description */}
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Job Description</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {job.description}
                  </p>
                </div>

                <Separator className="mb-6" />

                {/* Responsibilities */}
                {responsibilities.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Key Responsibilities</h2>
                      <ul className="space-y-2">
                        {responsibilities.map((responsibility: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm sm:text-base">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator className="mb-6" />
                  </>
                )}

                {/* Requirements */}
                {requirements.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Requirements</h2>
                      <ul className="space-y-2">
                        {requirements.map((requirement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600 text-sm sm:text-base">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator className="mb-6" />
                  </>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900">Benefits & Perks</h2>
                    <ul className="space-y-2">
                      {benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm sm:text-base">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Apply Card */}
            <Card className="border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <Button 
                  className="w-full mb-3 sm:mb-4 bg-[#039fb3] hover:bg-[#0288a1] h-11 sm:h-12 text-sm sm:text-base" 
                  size="lg"
                  onClick={() => setApplyModalOpen(true)}
                  disabled={!job.available || !user}
                >
                  {!user ? "Login to Apply" : job.available ? "Apply for this Job" : "Not Available"}
                </Button>
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  {!user 
                    ? "Please login to apply for this position"
                    : job.available 
                      ? "Apply now to join an amazing team" 
                      : "This position is currently not available"
                  }
                </p>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">About {job.company?.name || job.clinck || "the Company"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.company?.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Company Size</span>
                    <span className="font-medium text-sm sm:text-base">{job.company.size}</span>
                  </div>
                )}
                {job.company?.industry && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Industry</span>
                    <span className="font-medium text-sm sm:text-base">{job.company.industry}</span>
                  </div>
                )}
                {job.company?.founded && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Founded</span>
                    <span className="font-medium text-sm sm:text-base">{job.company.founded}</span>
                  </div>
                )}
                {job.company?.website && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Website</span>
                    <a 
                      href={job.company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline text-sm sm:text-base truncate ml-2"
                    >
                      Visit
                    </a>
                  </div>
                )}
                {job.company?.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Location</span>
                    <span className="font-medium text-sm sm:text-base text-right">{job.company.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Jobs */}
         
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Apply for {job.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The employer will receive a notification about your application immediately.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Cover Letter</label>
              <Textarea
                placeholder="Why are you interested in this position? What makes you a good fit?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setApplyModalOpen(false)}
              className="w-full sm:w-auto"
              disabled={applying}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={applying || !coverLetter.trim()}
              className="w-full sm:w-auto bg-[#039fb3] hover:bg-[#0288a1]"
            >
              {applying ? "Applying..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default JobDetail;