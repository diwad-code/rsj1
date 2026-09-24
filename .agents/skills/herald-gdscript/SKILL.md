---
name: herald-gdscript
description: "Wzorce GDScript dla projektu HERALD — Godot 4, izometryczne RPG. Aktywuj gdy piszesz skrypty .gd dla HERALD."
---

# HERALD GDScript Patterns

## Autoload Singleton pattern

```gdscript
# scripts/autoloads/EventBus.gd
class_name EventBus
extends Node

# Sygnały zdarzeń gry
signal resource_changed(data: Dictionary)
signal crew_morale_changed(crew_id: String, new_morale: int)
signal crew_dying(crew_id: String)
signal event_triggered(event_id: String)
signal event_choice_made(event_id: String, choice_id: String)
signal flag_set(flag_name: String, value: String)
signal voice_activated(skill: String, text: String, value: int)
signal turn_phase_changed(phase: String)
signal mission_time_advanced(minutes: int)
signal torpor_started()
signal torpor_ended()
signal echo_message(text: String)
```

## Izometryczny ruch postaci

```gdscript
# scripts/player/PlayerController.gd
class_name PlayerController
extends CharacterBody2D

const SPEED: float = 80.0
const INTERACTION_RADIUS: float = 32.0

@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var interaction_area: Area2D = $InteractionArea

var _can_interact: bool = false
var _nearest_interactable: Node2D = null

func _physics_process(delta: float) -> void:
    var direction := Input.get_vector(
        "move_left", "move_right", "move_up", "move_down"
    )
    if direction != Vector2.ZERO:
        velocity = direction.normalized() * SPEED
        _update_animation(direction)
    else:
        velocity = velocity.lerp(Vector2.ZERO, 0.2)
    move_and_slide()
    _check_interact_prompt()

func _input(event: InputEvent) -> void:
    if event.is_action_pressed("interact") and _nearest_interactable:
        _nearest_interactable.interact(self)

func _update_animation(direction: Vector2) -> void:
    # Izometryczna logika animacji — 4 kierunki
    var angle := direction.angle()
    if angle < -PI * 0.75 or angle > PI * 0.75:
        animation_player.play("walk_west")
    elif angle < -PI * 0.25:
        animation_player.play("walk_north")
    elif angle < PI * 0.25:
        animation_player.play("walk_east")
    else:
        animation_player.play("walk_south")

func _check_interact_prompt() -> void:
    var nearest: Node2D = null
    var min_dist := INTERACTION_RADIUS
    for body in interaction_area.get_overlapping_bodies():
        if body.has_method("interact"):
            var dist := global_position.distance_to(body.global_position)
            if dist < min_dist:
                min_dist = dist
                nearest = body
    _nearest_interactable = nearest
    # Pokaż/ukryj prompt przez EventBus
    if nearest:
        EventBus.echo_message.emit("Naciśnij E aby porozmawiać")
```

## NPC base pattern

```gdscript
# scripts/npc/NPCBase.gd
class_name NPCBase
extends CharacterBody2D

@export var crew_id: String = ""
@export var dialogue_resource: Resource = null

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

var _current_morale: int = 80

func _ready() -> void:
    EventBus.crew_morale_changed.connect(_on_morale_changed)
    _update_visual_state()

func _exit_tree() -> void:
    if EventBus.crew_morale_changed.is_connected(_on_morale_changed):
        EventBus.crew_morale_changed.disconnect(_on_morale_changed)

func interact(player: Node2D) -> void:
    ## Wywołane gdy gracz wchodzi w interakcję
    if dialogue_resource:
        EventBus.event_triggered.emit(crew_id + "_talk")
    GameManager.advance_mission_time(TimeSystem.TALK_SHORT_MINUTES)

func _on_morale_changed(changed_crew_id: String, new_morale: int) -> void:
    if changed_crew_id == crew_id:
        _current_morale = new_morale
        _update_visual_state()

func _update_visual_state() -> void:
    if _current_morale < 30:
        sprite.play("idle_low_morale")
    else:
        sprite.play("idle")
```

## Zmiana sceny (pokój statku)

```gdscript
# scripts/utils/SceneTransition.gd
class_name SceneTransition
extends Node

static func go_to_room(room_path: String) -> void:
    # Zachowaj pozycję gracza w GlobalState
    GameManager.save_player_position()
    get_tree().change_scene_to_file(room_path)
```

## Trigger wejścia do pomieszczenia

```gdscript
# Każde drzwi/przejście
@export var target_scene: String = "res://scenes/ship/Bridge.tscn"
@export var spawn_point_id: String = "door_south"

func _on_door_area_body_entered(body: Node2D) -> void:
    if body is PlayerController:
        GameManager.set_spawn_point(spawn_point_id)
        SceneTransition.go_to_room(target_scene)
```
