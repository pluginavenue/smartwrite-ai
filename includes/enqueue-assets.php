<?php
if (!defined('ABSPATH')) exit;

// Enqueue Classic Editor support (post editor screens)
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'post.php' && $hook !== 'post-new.php') return;

    // Enqueue Classic Editor AI script
    wp_enqueue_script(
        'smartwrite-ai-editor',
        SMARTWRITE_AI_URL . 'assets/js/editor-ai.js',
        ['jquery'],
        SMARTWRITE_AI_VERSION,
        true
    );

    // Localize data for JS
    wp_localize_script('smartwrite-ai-editor', 'smartwrite_ai', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('smartwrite_ai_nonce'),
    ]);

    // Enqueue shared admin styles for editor
    wp_enqueue_style(
        'smartwrite-admin-style',
        SMARTWRITE_AI_URL . 'assets/css/admin-style.css',
        [],
        filemtime(SMARTWRITE_AI_PATH . 'assets/css/admin-style.css')
    );
});

// Enqueue styles specifically for the SmartWrite settings page
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'settings_page_smartwrite-ai') {
        wp_enqueue_style(
            'smartwrite-admin-settings',
            SMARTWRITE_AI_URL . 'assets/css/admin-style.css',
            [],
            filemtime(SMARTWRITE_AI_PATH . 'assets/css/admin-style.css')
        );
    }
});

// Enqueue Gutenberg Block Editor support
add_action('enqueue_block_editor_assets', function () {
    // Block Sidebar Panel
    wp_enqueue_script(
        'smartwrite-editor-sidebar',
        SMARTWRITE_AI_URL . 'assets/js/block-editor.js',
        ['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-api-fetch'],
        filemtime(SMARTWRITE_AI_PATH . 'assets/js/block-editor.js'),
        true
    );

    wp_localize_script('smartwrite-editor-sidebar', 'SmartWriteBlockData', [
        'nonce' => wp_create_nonce('wp_rest'),
    ]);

    // Optional: Register main block script (if block.json is used)
    wp_register_script(
        'smartwrite-main-block',
        SMARTWRITE_AI_URL . 'assets/js/block.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-api-fetch'],
        filemtime(SMARTWRITE_AI_PATH . 'assets/js/block.js'),
        true
    );
});
