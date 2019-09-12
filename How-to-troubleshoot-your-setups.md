Once you deploy your solution, it may happen that it doesn't show up or fails to run. In general, there are myriads of causes why your application may be failing, but the diagnosis algorithm is more or less always the same.

In this document we will be explaining what's the best algorithm to the date to be able to diagnose a problem. Feel free to contribute any other steps, ideas, or solutions you may have applied in your case that you think is worth sharing with the community (you can create an issue and explain the case there, for example, so that we can add it to this page). Thanks in advance :slightly_smiling_face:.

Right now, the minimal steps to follow when something fails are:

1. First of all, try cleaning the output folders of your project and rebuilding everything again. We use some caching mechanisms to speed up incremental builds but they can fail if you update versions, add or remove dependencies, and in general, change project configuration.

Once you are sure that a clean build from scratch fails, try the following steps to diagnose the problem:

1. Mark the `Explain resolutions` checkbox in `Control Panel > Configuration > System Settings > Infrastructue > JavaScript Loader`: this makes the Loader dump diagnostic traces to the JavaScript console and/or any error it is finding. You may use the log level filters in your browser's console to decide what you want to see whether it is just errors or the whole debugging info.

2. Turn combo servlet off adding `javascript.fast.load=false` to your `portal.properties`: this makes the Loader request each JS module in a single HTTP request, so that it is easier to know what's going on.

This should ease debugging your code. We will keep adding tips and tricks to this page in the future so visit it once in a while.