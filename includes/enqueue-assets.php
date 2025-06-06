<?php
if (!defined('ABSPATH')) exit;

// Enqueue editor scripts
add_action('admin_enqueue_scripts', function($hook) {
    // Only load on post editor screens
    if ($hook !== 'post.php' && $hook !== 'post-new.php') return;

    wp_enqueue_script(
        'smartwrite-ai-editor',
        SMARTWRITE_AI_URL . 'assets/js/editor-ai.js',
        ['jquery'],
        SMARTWRITE_AI_VERSION,
        true
    );

    wp_localize_script('smartwrite-ai-editor', 'SmartWriteAI', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('smartwrite_ai_nonce'),
    ]);
});
