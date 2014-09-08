#include <node.h>
#include <nan.h>
#include <stdlib.h>
#include <math.h>

#include <AudioToolbox/AudioQueue.h>
#include <CoreAudio/CoreAudioTypes.h>
#include <CoreFoundation/CFRunLoop.h>


void inputCallback(void *custom_data, AudioQueueRef queue, AudioQueueBufferRef buffer, const AudioTimeStamp *start_time,
                        UInt32 num_packets, const AudioStreamPacketDescription *packet_desc);


NAN_METHOD(Input);
