// utils/postEvents.ts
import { useContext } from 'react';
import { AuthContext } from '@/Context/AuthContext';

// دالة بسيطة علشان نناديها من أي مكان
export const usePostEvents = () => {
  const { updateUserPosts, user } = useContext(AuthContext);
  
  const emitNewPost = (newPost: any) => {
    if (updateUserPosts && user && newPost.user?.id === user.id) {
      updateUserPosts(newPost);
    }
  };
  
  return { emitNewPost };
};