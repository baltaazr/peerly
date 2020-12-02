import React, { useRef, useEffect } from 'react';
import mergeRefs from 'react-merge-refs';

type VideoProps = {
  style?: object;
  self?: boolean;
  muted?: boolean;
  addVideo?: Function;
};

const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ style, self, muted, addVideo }: VideoProps, ref) => {
    const vidRef = useRef<HTMLVideoElement>();
    useEffect(() => {
      const connectVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        vidRef.current!.srcObject = stream;
        if (addVideo) addVideo(stream);
      };
      if (self) connectVideo();
      return () => {
        if (vidRef.current) {
          const stream = vidRef.current.srcObject as MediaStream;
          if (stream) {
            const tracks = stream.getTracks();

            tracks.forEach((track) => {
              track.stop();
            });
          }

          vidRef.current.srcObject = null;
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
        style={{ width: '100%', ...style }}
        playsInline
        autoPlay
        muted={muted}
      />
    );
  }
);

Video.displayName = 'Video';

export { Video };
