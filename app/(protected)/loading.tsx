import { SyncLoader } from 'react-spinners';
import Portal from '@/components/Portal';

const Loading: React.FC = () => {
    return (
        <Portal>
            <div className="w-full h-full flex justify-center items-center fixed inset-0 bg-gray-200/50 dark:bg-slate-900/50 z-50">
                <SyncLoader size={12} color="#9ca3af" />
            </div>
        </Portal>
    );
};

export default Loading;