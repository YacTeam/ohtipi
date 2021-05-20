module.exports = {
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
    text: {
        connected_string: "🟢 Connected to iMessage",
        error_string: "⚠️ Setup Ohtipi",
        update_available: "⏳ Update Available",
        update_downloaded: "⌛️ Update Downloaded, Restart App",
        download_progress: "⏳ Downloading Update:",
        recent_label: "Recent",
        open_at_login_label: "Open at Login",
        quit_label: "Quit Ohtipi",
        history_item_template: "<code> - <service>",
        overlay_subtitle: "Copied to Clipboard",
        resync: "Sync Recent Messages"
    }
}