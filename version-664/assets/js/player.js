(function () {
    function initializePlayer(url) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        var button = document.querySelector("[data-player-button]");
        var loaded = false;
        var hlsInstance = null;

        if (!video || !url) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                video.src = url;
            }
        }

        function play() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initializePlayer = initializePlayer;
})();
