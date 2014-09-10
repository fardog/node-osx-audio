#include "OSXAudioInput.h"

#include <AudioToolbox/AudioQueue.h>
#include <CoreAudio/CoreAudioTypes.h>
#include <CoreFoundation/CFRunLoop.h>

#define NUM_CHANNELS 2
#define NUM_BUFFERS 4
#define BUFFER_SIZE 4096
#define SAMPLE_TYPE short
#define MAX_NUMBER 32767
#define SAMPLE_RATE 44100

OSXAudioInput :: OSXAudioInput() {
	format.mSampleRate = SAMPLE_RATE;
	format.mFormatID = kAudioFormatLinearPCM;
	format.mFormatFlags = kLinearPCMFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
	format.mBitsPerChannel = 8 * sizeof(SAMPLE_TYPE);
	format.mChannelsPerFrame = NUM_CHANNELS;
	format.mBytesPerFrame = sizeof(SAMPLE_TYPE) * NUM_CHANNELS;
	format.mFramesPerPacket = 1;
	format.mBytesPerPacket = format.mBytesPerFrame * format.mFramesPerPacket;
	format.mReserved = 0;
}

void OSXAudioInput :: openInput(OSXAudioInput::OSXAudioCallback callback, void *userData) {
	unsigned int i;

	inputData_.userCallback = callback;
	inputData_.userData = userData;
	inputData_.usingCallback = true;

	// Initialize Input
	printf("initializing audio queue\n");
	AudioQueueNewInput(&format, inputCallback_, &inputData_, CFRunLoopGetCurrent(), kCFRunLoopCommonModes, 0, &inQueue);
	for (i = 0; i < NUM_BUFFERS; i++)
	{
		printf("allocating buffer\n");
		AudioQueueAllocateBuffer(inQueue, BUFFER_SIZE, &inBuffers[i]);
		AudioQueueEnqueueBuffer(inQueue, inBuffers[i], 0, NULL);
	}
	printf("starting audio queue\n");
	AudioQueueStart(inQueue, NULL);
	printf("running loop\n");
	CFRunLoopRun();
}

void OSXAudioInput :: closeInput() {
	// TODO something
}

void OSXAudioInput :: inputCallback_(void *custom_data, AudioQueueRef queue,
		AudioQueueBufferRef buffer, const AudioTimeStamp *start_time, UInt32 num_packets,
		const AudioStreamPacketDescription *packet_desc) {
	printf("received data\n");
	OSXAudioInData *data = (OSXAudioInData *) custom_data;

	SAMPLE_TYPE *casted_buffer = (SAMPLE_TYPE *)buffer->mAudioData;

	if ( data->usingCallback ) {
		OSXAudioInput::OSXAudioCallback callback = (OSXAudioInput::OSXAudioCallback) 
			data->userCallback;
		callback( (std::vector<unsigned char> *)buffer->mAudioData, data->userData );
		//callback( (std::vector<unsigned char> *)"omg", data->userData );
	}

	AudioQueueEnqueueBuffer(queue, buffer, 0, NULL);
}


/*struct RecorderState {
	NanCallback *callback;
	uv_loop_t *uv_;
};

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Number;
using v8::Value;
using v8::String;
using v8::Object;
using node::Buffer;

NAN_METHOD(Input) {
	NanScope();

	RecorderState state;
	Local<Function> callbackHandle = args[0].As<Function>();
	state.callback = new NanCallback(callbackHandle);
	state.uv_ = uv_default_loop();

	unsigned int i;
	AudioStreamBasicDescription format;
	AudioQueueRef inQueue;
	AudioQueueBufferRef inBuffers[NUM_BUFFERS];

	format.mSampleRate = SAMPLE_RATE;
	format.mFormatID = kAudioFormatLinearPCM;
	format.mFormatFlags = kLinearPCMFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
	format.mBitsPerChannel = 8 * sizeof(SAMPLE_TYPE);
	format.mChannelsPerFrame = NUM_CHANNELS;
	format.mBytesPerFrame = sizeof(SAMPLE_TYPE) * NUM_CHANNELS;
	format.mFramesPerPacket = 1;
	format.mBytesPerPacket = format.mBytesPerFrame * format.mFramesPerPacket;
	format.mReserved = 0;
	AudioQueueNewInput(&format, inputCallback, &state, CFRunLoopGetCurrent(), kCFRunLoopCommonModes, 0, &inQueue);
	for (i = 0; i < NUM_BUFFERS; i++)
	{
		AudioQueueAllocateBuffer(inQueue, BUFFER_SIZE, &inBuffers[i]);
		AudioQueueEnqueueBuffer(inQueue, inBuffers[i], 0, NULL);
	}
	AudioQueueStart(inQueue, NULL);
	CFRunLoopRun();

	NanReturnUndefined();
}


void inputCallback(void *custom_data, AudioQueueRef queue, AudioQueueBufferRef buffer, const AudioTimeStamp *start_time, UInt32 num_packets, const AudioStreamPacketDescription *packet_desc) {
	RecorderState *state = (RecorderState *) custom_data;

	SAMPLE_TYPE *casted_buffer = (SAMPLE_TYPE *)buffer->mAudioData;

	Local<Value> argv[] = {
		NanNull(),
		NanNewBufferHandle((char *)buffer->mAudioData, num_packets)
	};
	state->callback->Call(2, argv);

	uv_run(state->uv_, UV_RUN_NOWAIT);
	AudioQueueEnqueueBuffer(queue, buffer, 0, NULL);
}


void Init(v8::Handle<Object> exports) {
	exports->Set(NanNew("input"), NanNew<v8::FunctionTemplate>(Input)->GetFunction());
}

NODE_MODULE(bindings, Init)*/
