import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('tb_posts', function(table) {
        table.string('id').primary();  
        table.string('user_id').notNullable();  
        table.binary('image').notNullable();  
        table.string('description');
        table.enu('visibility_status', ['public', 'private', 'friends_only']).defaultTo('public'); 
        table.integer('likes_count').defaultTo(0); 
        table.integer('comments_count').defaultTo(0); 
        table.timestamp('created_at').defaultTo(knex.fn.now());  
        table.timestamp('updated_at');  
        table.timestamp('deleted_at');  

        table.foreign('user_id').references('id').inTable('tb_users').onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('tb_posts');
}
