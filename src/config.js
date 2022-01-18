module.exports = {
    dev: {
        // logs otp results to console
        debug: false
    },
    build: {
        setApp: false,
        universal: false
    },
    shortcuts: {
        resync_and_copy: "CommandOrControl+Shift+E"
    },
    imessage: {
        max_connection_attempts_per_session: 10,
        connection_wait_ms: 6000
    },
    overlay: {
        offset: {
            x: 10,
            y: 80
        }
    },
    timeouts: {
        tray_title_ms: 800,
    },
    text: {
        unknown_string: "Unknown",
        connected_string: "🟢 Connected to iMessage",
        error_string: "⚠️ Setup Ohtipi",
        update_available: "⏳ Update Available",
        update_downloaded: "⌛️ Update Downloaded, Restart App",
        download_progress: "⏳ Downloading Update:",
        recent_label: "Recent",
        open_at_login_label: "Open at Login",
        open_at_login_tooltip: "Open Ohtipi automatically when you power on your Mac",
        quit_label: "Quit Ohtipi",
        history_item_template: "<code> - <service>",
        overlay_subtitle: "Copied to Clipboard",
        resync: "Resync && Copy", // needs to escape ampersand with second ampersand (not a typo here)
        resync_and_copy_tooltip: "Sometimes iMessage likes to sleep on the job. If OhTipi ever misses a message, use this option to sync recent messages and copy the latest code to your clipboard",
        nothing_to_sync: "Nothing to sync...",
        sync_success: "Copied!",
        credit_window_title: "About Ohtipi",
        credits: "Ohtipi was developed by Alec Armbruster, Justin Mitchell at Yac. https://ohtipi.com"
    }
}