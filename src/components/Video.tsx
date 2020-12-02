import React, { useRef, useEffect } from 'react';
import mergeRefs from 'react-merge-refs';

type VideoProps = {
  style?: object;
  self?: boolean;
  muted?: boolean;
  addStream?: Function;
  removeStream?: Function;
};

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ style, self, muted, addStream, removeStream }: VideoProps, ref) => {
    const vidRef = useRef<HTMLVideoElement>();
    useEffect(() => {
      const connectVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        vidRef.current!.srcObject = stream;
        if (addStream) addStream(stream);
      };

      const vidRefCopy = vidRef.current;
      if (self) connectVideo();
      return () => {
        if (vidRefCopy) {
          const stream = vidRefCopy.srcObject as MediaStream;
          if (removeStream) removeStream(stream);
          if (stream) {
            const tracks = stream.getTracks();

            tracks.forEach((track) => {
              track.stop();
            });
          }
        }
      };
    }, [
      (() => {
        return vidRef.current;
      })()
    ]);

    return (
      <video
        ref={mergeRefs([ref, vidRef])}
        style={{
          width: '100%',
          ...style
        }}
        playsInline
        autoPlay
        muted={muted}
      />
    );
  }
);

Video.displayName = 'Video';

export { Video };
