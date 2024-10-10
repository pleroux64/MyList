# Generated by Django 5.1.2 on 2024-10-10 03:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0002_usermediainteraction'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usermediainteraction',
            name='status',
            field=models.CharField(choices=[('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch'), ('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch'), ('watched', 'Watched'), ('watching', 'Watching'), ('plan_to_watch', 'Plan to Watch'), ('played', 'Played'), ('playing', 'Playing'), ('plan_to_play', 'Plan to Play')], max_length=20),
        ),
    ]
