import React from 'react';
// eslint-disable-next-line no-unused-vars
const Loading = ({ bg = false }) => {
    return (
        <div className="flex w-full min-h-[40vh] h-full items-center justify-center" role="status" aria-label="Loading">
            <span className="h-8 w-8 rounded-full border-[3px] border-primary5/40 border-t-primary2 animate-spin" />
        </div>
    );
};

export default Loading;
