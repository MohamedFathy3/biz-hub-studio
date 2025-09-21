import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const contacts = [
  { id: 1, name: "Hurin Seary", online: true, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 2, name: "Victor Exrixon", online: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 3, name: "Surfiya Zakir", online: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
  { id: 4, name: "Goria Coast", online: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 5, name: "Hurin Seary", online: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80" },
  { id: 6, name: "David Goria", online: true, avatar: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 7, name: "Seary Victor", online: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" },
  { id: 8, name: "Ana Seary", online: false, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80" },
];

const groups = [
  { id: 1, name: "UD Studio Express", time: "2 min", avatar: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80", online: true },
  { id: 2, name: "AR Armany Design", time: "", avatar: "https://images.unsplash.com/photo-1682687980961-78fa83781450?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80", online: true },
  { id: 3, name: "UD De fabous", time: "", avatar: "https://images.unsplash.com/photo-1682695796497-31a44224d6d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80", online: false },
];

const pages = [
  { id: 1, name: "AB Armany Seary", avatar: "https://images.unsplash.com/photo-1682687982502-1529b3b33f85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80", online: true },
];

export default function ContactsGroups() {
  return (
    <div className="fixed top-15 right-5 w-80 bg-white rounded-lg shadow-md p-5 space-y-6 h-[90vh] overflow-y-auto scrollbar-hide">
      {/* CONTACTS Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">CONTACTS</h3>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={contact.avatar} 
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <span className="font-medium text-gray-800">{contact.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* GROUPS Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">GROUPS</h3>
        <div className="space-y-2">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={group.avatar} 
                    alt={group.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${group.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div>
                  <span className="font-medium text-gray-800 block">{group.name}</span>
                  {group.time && <span className="text-xs text-gray-500">{group.time}</span>}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${group.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* PAGES Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">PAGES</h3>
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={page.avatar} 
                    alt={page.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${page.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <span className="font-medium text-gray-800">{page.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${page.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}