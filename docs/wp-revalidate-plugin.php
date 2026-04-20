<?php
/**
 * Plugin Name: Dance Directory Revalidate
 * Description: Pings the Next.js /api/revalidate endpoint whenever a dance_studio post is saved or published, triggering ISR for that listing.
 * Version: 1.0.0
 * Author: Private Dance Directory
 */

defined('ABSPATH') || exit;

// ── Configuration ──────────────────────────────────────────────────────────────
// Set these two constants in wp-config.php:
//   define('DANCE_NEXTJS_URL',        'https://www.ballroomdancedirectory.com');
//   define('DANCE_REVALIDATE_SECRET', 'your-shared-secret-here');

define('_DANCE_NEXTJS_URL',        defined('DANCE_NEXTJS_URL')        ? DANCE_NEXTJS_URL        : 'https://www.ballroomdancedirectory.com');
define('_DANCE_REVALIDATE_SECRET', defined('DANCE_REVALIDATE_SECRET') ? DANCE_REVALIDATE_SECRET : '');

// ── Hook into save_post for dance_studio CPT ───────────────────────────────────

add_action('save_post_dance_studio', 'dance_dir_revalidate', 10, 3);

/**
 * Fire revalidation webhook after a dance_studio post is saved.
 *
 * @param int     $post_id
 * @param WP_Post $post
 * @param bool    $update  True if this is an update, false if new post.
 */
function dance_dir_revalidate($post_id, $post, $update) {
    // Skip autosaves and revisions
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (wp_is_post_revision($post_id))               return;
    if ($post->post_status === 'auto-draft')          return;

    $secret = _DANCE_REVALIDATE_SECRET;
    if (empty($secret)) {
        error_log('[dance-revalidate] DANCE_REVALIDATE_SECRET is not set — skipping revalidation.');
        return;
    }

    $slug = $post->post_name;
    $city = get_post_meta($post_id, 'city', true);

    $body = wp_json_encode([
        'secret' => $secret,
        'slug'   => $slug,
        'city'   => $city ?: null,
    ]);

    $endpoint = rtrim(_DANCE_NEXTJS_URL, '/') . '/api/revalidate';

    $response = wp_remote_post($endpoint, [
        'method'    => 'POST',
        'timeout'   => 10,
        'headers'   => [
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ],
        'body'      => $body,
        'sslverify' => true,
    ]);

    if (is_wp_error($response)) {
        error_log('[dance-revalidate] wp_remote_post error: ' . $response->get_error_message());
    } else {
        $code = wp_remote_retrieve_response_code($response);
        $body_resp = wp_remote_retrieve_body($response);
        error_log("[dance-revalidate] POST {$endpoint} → HTTP {$code}: {$body_resp}");
    }
}

// ── Admin notice if constants are not set ──────────────────────────────────────

add_action('admin_notices', function() {
    if (!current_user_can('manage_options')) return;
    if (empty(_DANCE_REVALIDATE_SECRET)) {
        echo '<div class="notice notice-warning"><p><strong>Dance Directory Revalidate:</strong> '
           . 'Please add <code>define(\'DANCE_REVALIDATE_SECRET\', \'your-secret\');</code> to <code>wp-config.php</code>.</p></div>';
    }
});
