{
	"targets": [ {
		"target_name": "bindings",
			"sources": [
				"src/input.cc"
			],
			"include_dirs": [
				"<!(node -e \"require('nan')\")",
				"System/Library/Frameworks/CoreFoundation.framework/Headers",
				"System/Library/Frameworks/AudioToolbox.framework/Headers",
				"System/Library/Frameworks/CoreAudio.framework/Headers"
			],
			"link_settings": {
				"libraries": [
					"-framework CoreFoundation",
					"-framework CoreAudio",
					"-framework AudioToolbox"
				]
			}
	} ]
}
