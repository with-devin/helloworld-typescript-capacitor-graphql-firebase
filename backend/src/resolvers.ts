import { db } from './firebase';

export const resolvers = {
  Query: {
    hello: async () => {
      try {
        const helloRef = db.collection('messages').doc('hello');
        const doc = await helloRef.get();
        
        if (!doc.exists) {
          const helloData = {
            text: 'Hello World from Firestore!',
            created_at: null // SERVER_TIMESTAMP doesn't serialize well here
          };
          
          await helloRef.set({
            text: helloData.text,
            created_at: new Date()
          });
          
          return helloData;
        }
        
        const data = doc.data();
        let formattedDate = null;
        
        if (data?.created_at) {
          if (typeof data.created_at === 'string') {
            formattedDate = data.created_at;
          } else if (data.created_at.toDate && typeof data.created_at.toDate === 'function') {
            formattedDate = data.created_at.toDate().toISOString();
          } else if (data.created_at instanceof Date) {
            formattedDate = data.created_at.toISOString();
          }
        }
        
        return {
          text: data?.text || 'Hello World!',
          created_at: formattedDate
        };
      } catch (error) {
        console.error('Error fetching hello message:', error);
        return {
          text: 'Error fetching message',
          created_at: null
        };
      }
    }
  }
};
