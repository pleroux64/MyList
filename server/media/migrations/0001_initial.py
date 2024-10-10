# Generated by Django 5.1.2 on 2024-10-10 00:46

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('media_type', models.CharField(choices=[('movie', 'Movie'), ('anime', 'Anime'), ('tv_show', 'TV Show'), ('video_game', 'Video Game')], max_length=20)),
                ('rating', models.FloatField(default=0.0)),
            ],
        ),
    ]
