<?php 
if (!defined('ABSPATH')) exit;

// Enqueue Classic Editor support
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'post.php' && $hook !== 'post-new.php') return;

    // Enqueue AI script
    wp_enqueue_script(
        'smartwrite-ai-editor',
        SMARTWRITE_AI_URL . 'assets/js/editor-ai.js',
        ['jquery'],
        SMARTWRITE_AI_VERSION,
        true
    );

    // Localize data for JS (nonce, ajax URL, etc.)
    wp_localize_script('smartwrite-ai-editor', 'smartwrite_ai', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('smartwrite_ai_nonce'),
    ]);
});

// Register and enqueue Gutenberg editor assets
add_action('enqueue_block_editor_assets', function () {
    // Sidebar script
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

    // Optional: block script (only if you have block.json using this)
    wp_register_script(
        'smartwrite-main-block',
        SMARTWRITE_AI_URL . 'assets/js/block.js',
        ['wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-api-fetch'],
        filemtime(SMARTWRITE_AI_PATH . 'assets/js/block.js'),
        true
    );
});
